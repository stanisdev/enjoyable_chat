const express = require('express');

/**
 * Base ctrl
 */
module.exports = (app, wrapper, config, {services}) => {
  const db = app.get('db');
  const router = express.Router();
  const {filters, validators} = services;

  /**
   * Home action
   */
  router.get('/', filters.auth, wrapper(async (req, res) => {
    const chats = await db.model('Chat').getMyChats(req.user._id);
    res.render('chats/list.html', { chats });
  }));

  /**
   * Get messages by chat id
   */
  router.get('/:id', filters.auth, filters.incomingDataValidation(validators.id), filters.isChatMember(db), wrapper(async (req, res) => {
    console.log(req.session.userId);
    const messages = await db.model('Message').getMessagesByChat(req.params.id, req.user.id);
    res.render('chats/messages.html', { messages, chat: req.chat });
  }));

  app.use('/chats', router);
};
