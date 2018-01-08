const Router = require('koa-router');
const db = require('mongoose');
const passport = require('koa-passport');
const validators = require('./../services/validators');
const filters = require('./../services/filters');

const router = new Router({
  prefix: '/users'
});

/**
 * List of users (filter by name can be used)
 */
router.get('/', async ctx => {
  const { query } = ctx.query;
  const users = await db.model('User').findAllByQuery(query, ctx.state.user._id);

  await ctx.render('users/list', {
    title: 'Users',
    users,
    query
  });
});

/**
 * Set new relationship between current user and other
 */
router.get('/relationship', passport.authRequired, async ctx => {
  const defendantId = ctx.query.defendant;
  const currUserId = ctx.state.user._id;

  switch (+ctx.query.type) {
    case 0:
      // Add to friends
      await db.model('Relationship').sendFriendshipRequest(currUserId, defendantId);
      break;
  }
  ctx.redirect('/users');
});

/**
 * Write message to user
 */
router.get('/write', passport.authRequired, async ctx => {
  const currUserId = ctx.state.user._id;
  const friendId = ctx.query.id;

  const isFriend = await db.model('User').isFriend(currUserId, friendId);
  if (!isFriend) {
    ctx.throw(400, 'It\'s allowed to write only friends');
  }
  var chat = await db.model('Chat').findChatByMembers(currUserId, friendId);
  if (!(chat instanceof Object)) {
    chat = await db.model('Chat').createChat([currUserId, friendId], { 
      name: ctx.state.user.name,
      type: 0 
    });
  }
  ctx.redirect(`/chats/${chat._id}`);
});


module.exports = router;