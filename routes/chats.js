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
 * Write new message
 */
router.post('/:id/write', passport.authRequired, validators.url.hasObjectId, filters.isChatMember, async ctx => {
  const {content} = ctx.request.body;
  const chatId = ctx.chat._id;
  const members = await db.model('Chat').getMembers(chatId);

  // Создать такой промис, который будет переходить в 3 состояния 
  // (1 - когда произошло сохранение | 2 - когда ошибка сохранения | 3 - когда ошибка валидации)
  ctx.body = {
    success: true,
    data: ctx.params.id
  };
});

/**
 * Get messages by chat id
 */
router.get('/:id', passport.authRequired, validators.url.hasObjectId, filters.isChatMember, async ctx => {
  const messages = await db.model('Message').getMessagesByChat(ctx.params.id, ctx.state.user._id);
  await ctx.render('chats/messages', {
    title: 'Chat messages',
    chat: ctx.chat, 
    messages
  });
});

/**
 * Create group chat
 */
router.get('/new/group', passport.authRequired, async ctx => {
  const friends = await db.model('User').getFriends( ctx.state.user._id );
  await ctx.render('chats/newGroup', {
    title: 'Create new group chat',
    friends
  })
});

/**
 * Create group chat (POST)
 */
router.post('/new/group', passport.authRequired, async ctx => {
  const { body } = ctx.request;
  const name = body.name;
  delete body.name;

  const ids = Object.keys(body);
  if (ids.length < 1) {
    ctx.flash.message = 'Select some friends to chat';
    return ctx.redirect('/chats/new/group');
  }
  const members = ids.map((id) => {
    return {
      user: id,
      is_deleted: false,
      role: 0
    };
  });
  members.push({
    user: ctx.state.user._id,
    is_deleted: false,
    role: 99
  });
  
  const chat = new (db.model('Chat'))({
    type: 1,
    name,
    members
  });
  const errors = chat.validateSync();
  if (errors) {
    ctx.flash.message = db.prettyValidationErrors(errors);
    return ctx.redirect('/chats/new/group');
  }
  try {
    await chat.save();
  } catch (err) {
    return ctx.throw(400, err);
  }
  ctx.redirect(`/chats/${chat._id}`);
});

module.exports = router;