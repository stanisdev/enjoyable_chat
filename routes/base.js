const express = require('express');

/**
 * Base ctrl
 */
module.exports = (app, wrapper, config, {services}) => {
  const db = app.get('db');
  const router = express.Router();
  const {validators, filters} = services;
  const redisClient = require(config.root_dir + '/dependencies/redisClient');
  const ee = app.get('ee');

  /**
   * Home action
   */
  router.get('/', wrapper(async (req, res) => {
    res.render('base/index.html');
  }));

  /**
   * Login to system
   */
  router.post('/login', filters.incomingDataValidation(validators.login), wrapper(async (req, res) => {
    const user = await db.model('User').findOne({
      email: req.body.email
    }, 'name salt password state');
    if (!(user instanceof Object)) {
      return res.json({
        success: false,
        message: 'Email not found'
      });
    }
    if (user.state < 1) {
      return res.json({
        success: false,
        message: 'Authorization not allowed'
      });
    }
    if (!user.isPasswordValid(req.body.password)) {
      return res.json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    await user.set('lastLogin', new Date()).save();
    req.session.userId = user.id;
    res.redirect('/');
  }));

  /**
   * Leave system
   */
  router.get('/logout', filters.auth, wrapper(async (req, res) => {
    req.session.destroy(async err => {
      if (err) {
        console.error(err);
        return res.json({
          success: false,
          message: "It's not allowed to destroy session"
        });
      }
      const client = redisClient.getClient();
      const key = 'sockdata:' + req.user._id;
      const socketId = await client.getAsync(key);
      await client.delAsync(key);

      if (typeof socketId == 'string') {
        ee.emit('user:logouted', { socketId });
      }
      res.redirect('/');
    });
  }));

  app.use('/', router);
};
