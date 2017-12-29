const Router = require('koa-router');
const path = require('path');
const passport = require('koa-passport');

const router = new Router();

/**
 * Index page
 */
router.get('/', async ctx => {
  await ctx.render('main/index', {
    title: 'Enjoyable Chat'
  });
});

module.exports = router;