module.exports = async (ctx, next) => {

  ctx.flash = new Proxy({}, {
    get: function(target, propName) {
      if (!('flash' in ctx.session)) {
        return null;
      }
      const value = ctx.session.flash[propName];
      if (value) {
        ctx.session.flash = undefined;
        return value;
      }
      return null;
    },
    set: function(target, propName, value) {
      if (!(ctx.session.flash instanceof Object)) {
        ctx.session.flash = {};
      }
      ctx.session.flash[propName] = value;
    }
  });

  await next();
};