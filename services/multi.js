/**
 * Multi promise
 * @param {*function} mainCb 
 */
module.exports = function(mainCb) {
  var match = /\([^\)]+\)/g.exec(mainCb.toString());
  var args = match[0].slice(1, -1).split(',').map(e => e.trim());
  var attached = [];
  var handlers = [];
  var done = Symbol('Complete promise');
  var resolvers = {
    [done]: null
  };

  var states = new Proxy({}, {
    get: function(target, prop) {
      if (Reflect.has(target, prop)) {
        if (attached.includes(prop)) {
          throw new Error(`Handler for ${prop} already attached`);
        }
        attached.push(prop);
      }
      return Reflect.get(target, prop);
    }
  });

  args.forEach((arg) => {
    states[arg] = function(cb) {
      resolvers[arg] = cb;
      if (mainCb.length == attached.length) {
        return new Promise(function(resolve, reject) {
          resolvers[done] = resolve;
          mainCb(...handlers);
        });
      }
      return this;
    };
    handlers.push(
      (function() {
        var [handlerName, ...data] = Array.prototype.slice.call(arguments);
        resolvers[handlerName](...data.concat(resolvers[done]));
      }).bind(this, arg)
    );
  });
  
  return states;
};
