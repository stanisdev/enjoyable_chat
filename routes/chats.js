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

  /**
   * Write to chat
   */
  router.post('/:id/write', filters.auth, filters.incomingDataValidation(validators.id), filters.isChatMember(db), wrapper(async (req, res) => {
    let members = await db.model('Chat').getMembers(req.chat.id);
    members = members.members.map(element => {
      return {
        user: element.user,
        value: ( element.user == req.user.id ? 2 : 0 )
      };
    });
    const MessageModel = mongoose.model('Message');
    const message = {
      content: req.body.content,
      type: 'text/plain',
      chat: req.chat.id,
      author: req.user.id,
      statuses: members
    };
  }));

  app.use('/chats', router);
};
