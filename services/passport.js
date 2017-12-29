const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('mongoose');

/**
 * Extract only necessary data
 */
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

/**
 * Fetch user data
 */
passport.deserializeUser(async function (id, done) {
  try {
    const user = await db.model('User').findOne({
      _id: id,
      state: {
        $gt: 0
      }
    }, 'name email state');
    done(null, user);
  } catch (err) {
    done(err);
  }
});

/**
 * Do auth
 */
passport.use(new LocalStrategy(async function (email, password, done) {
  try {
    const user = await db.model('User').findOne({
      email
    }, 'name salt password state');
    if (!(user instanceof Object) || user.state < 1 || !user.isPasswordValid(password)) { // @TODO move login form to separately page
      return done(null, false);
    }
    await user.set('lastLogin', new Date()).save();
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

/**
 * Is user authorized middleware
 */
passport.authRequired = async function (ctx, next) {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.redirect('/');
  }
};