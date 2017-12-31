const Router = require('koa-router');
const passport = require('koa-passport');
const db = require('mongoose');
const app = require('./../app');
const redisClient = require('./../services/redisClient');

const router = new Router({
  prefix: '/account'
});

/**
 * Login post handler
 */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/chats',
  failureRedirect: '/'
}));

/**
 * Logout from system
 */
router.get('/logout', async ctx => {
  const socketId = await redisClient.getAsync(`socket:${ctx.state.user._id}`);
  ctx.session = null;
  ctx.logout();
  app.emit('account:logouted', socketId);
  ctx.redirect('/');
});

module.exports = router;