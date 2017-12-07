const express = require('express');
const Joi = require('joi');

const login = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }
};

/**
 * Base ctrl
 */
module.exports = (app, wrapper, config, middlewares, services) => {
  const db = app.get('db');
  const router = express.Router();
  const validators = services.validators;
  const filters = services.filters;

  /**
   * Home action
   */
  router.get('/', wrapper(async (req, res) => {
    res.render('base/index.html');
  }));

  /**
   * Login to system
   */
  router.post('/login', middlewares.validation(validators.login), wrapper(async (req, res) => {
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
    delete req.session.userId;
    res.redirect('/');
  }));

  app.use('/', router);
};
