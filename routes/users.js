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
  const {
    query
  } = ctx.query;
  const users = await db.model('User').findAllByQuery(query, ctx.state.user._id);

  await ctx.render('users/list', {
    title: 'Users',
    users
  });
});

/**
 * Set new relationship between current user and other
 */
router.get('/relationship/:id/type/:type', passport.authRequired, validators.url.hasObjectId, validators.url.hasType, filters.isUserExists, async ctx => {
  const defendantId = ctx.params.id;
  const currUserId = ctx.state.user._id;

  switch (+ctx.params.type) {
    case 0:
      // Add to friends
      await db.model('Relationship').sendFriendshipRequest(currUserId, defendantId);
      break;
  }
  ctx.body = 'AA';
});


module.exports = router;