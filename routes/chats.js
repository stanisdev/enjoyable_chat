const Router = require('koa-router');
const passport = require('koa-passport');
const db = require('mongoose');
const filters = require('./../services/filters');
const validators = require('./../services/validators');

const router = new Router({
  prefix: '/chats'
});

/**
 * List of chats
 */
router.get('/', passport.authRequired, async ctx => {
  const chats = await db.model('Chat').getMyChats(ctx.state.user._id);
  await ctx.render('chats/list', {
    title: 'My Chat',
    chats
  });
});

/**
 * Get messages by chat id
 */
router.get('/:id', passport.authRequired, validators.url.hasObjectId, filters.isChatMember, async ctx => {
  const chat = await db.model('Chat').findById(ctx.params.id);
  const messages = await db.model('Message').getMessagesByChat(ctx.params.id, ctx.state.user._id);
  await ctx.render('chats/messages', {
    title: 'Chat messages',
    chat: ctx.chat, 
    messages
  });
});

module.exports = router;