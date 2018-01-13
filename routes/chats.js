const Router = require('koa-router');
const passport = require('koa-passport');
const db = require('mongoose');
const filters = require('./../services/filters');
const validators = require('./../services/validators');
const redisClient = require('./../services/redisClient');
const app = require('./../app');
const only = require('only');

const router = new Router({
  prefix: '/chats'
});

/**
 * List of chats
 */
router.get('/', passport.authRequired, async ctx => {
  const chats = await db.model('Chat').getMyChats(ctx.state.user._id);
  await ctx.render('chats/list', {
    title: 'Chats',
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

  await db.model('Message').createMessage(chatId, ctx.state.user._id, content, members)
    .saved(async (message, members, next) => {
      message = only(message, '_id chat content type created_at');
      message = Object.assign({ author: ctx.state.user }, message);

      ctx.body = {
        success: true,
        data: message
      };
      // Find memebrs socket.id by their user._id in redis
      const socketIds = await Promise.all(
        members.map(async member => {
          return await redisClient.getAsync(`socket:${member}`);
        })
      );
      app.emit('chat:message', { socketIds, message });
      next();
    })
    .notValid((errors, next) => {
      ctx.body = {
        success: false,
        message: errors
      };
      next();
    })
    .error((message, next) => {
      ctx.body = {
        success: false,
        message: 'Unknown error'
      };
      next();
    });
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

/**
 * Add new member in chat
 */
router.post('/:id/add_member', passport.authRequired, validators.url.hasObjectId, filters.isChatMember, async ctx => {
  const userId = ctx.request.body.user_id;
  const chatId = ctx.params.id;

  if (validators.custom.objectId(userId).error != null) {
    return ctx.body = {
      success: false,
      message: 'User Id is incorrect'
    };
  }
  // Check is user not member of chat yet
  let members = ctx.chat.members;
  for (let i = 0; i < members.length; i++) {
    if (members[i].user.toString() == userId) {
      return ctx.body = {
        success: false,
        message: 'User already in chat'
      };
    }
  }
  try {
    await ctx.chat.addMember(userId, 0);
  } catch (err) {
    console.log(err);
    return ctx.body = {
      success: false,
      message: 'User not added. Try again'
    };
  }
  ctx.body = {
    success: true
  };
});

/**
 * Receive message ids and mark them as readed
 */
router.post('/:id/messages/status', 
  passport.authRequired, 
  validators.url.hasObjectId,
  validators.body.hasIds, 
  validators.body.hasStatus, 
  filters.isChatMember, 
async ctx => {
  const {ids, status} = ctx.request.body;
  const userId = ctx.state.user._id;
  const messages = await db.model('Message').findByIds(ids, ctx.chat._id, userId, status);
  if (!Array.isArray(messages)) {
    return ctx.body = {
      success: false,
      message: 'Nothing to update'
    };
  }
  try {
    await db.model('Message').updateStatus(messages.map(m => m._id), userId, status);    
  } catch (err) {
    return ctx.body = {
      success: false,
      message: 'Statuses not updated'
    };
  }
  ctx.body = {
    success: true
  };
});

module.exports = router;