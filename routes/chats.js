const express = require('express');

/**
 * Base ctrl
 */
module.exports = (app, wrapper, config, {services}) => {
  const db = app.get('db');
  const router = express.Router();
  const {filters} = services;

  /**
   * Home action
   */
  router.get('/', filters.auth, wrapper(async (req, res) => {
    const chats = await db.model('Chat').getMyChats(req.user._id);
    res.render('chats/index.html', { chats });
  }));

  app.use('/chats', router);
};
