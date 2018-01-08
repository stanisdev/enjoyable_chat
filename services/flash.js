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
    },
    has: function(target, prop) {
      return ctx.session.flash instanceof Object && ctx.session.flash.hasOwnProperty(prop); 
    }
  });

  // Rendering
  ctx.state.hasFlash = () => {
    return Reflect.has(ctx.flash, 'message');
  };
  ctx.state.getFlash = () => {
    var message = ctx.flash.message;
    if (typeof message == 'string') {
      message = message.replace(/\n/g, '<br />');
    }
    return message;
  };

  await next();
};