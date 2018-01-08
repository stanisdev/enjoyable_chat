/**
 * Multi promise
 * @param {*function} mainCb 
 */
module.exports = function(mainCb) {
  var match = /\([^\)]+\)/g.exec(mainCb.toString());
  var args = match[0].slice(1, -1).split(',').map(e => e.trim());
  var attached = [];
  var handlers = [];

  var states = new Proxy({}, {
    get: function(target, prop) {
      if (Reflect.has(target, prop)) {
        if (attached.includes(prop)) {
          throw new Error(`Handler for ${prop} already attached`);
        }
        attached.push(prop);
        if (mainCb.length == attached.length) {
          mainCb(...handlers);
        }
        return target[prop];
      } else {
        throw new Error(`Property ${prop} not passed`);
      }
    }
  });

  args.forEach((arg) => {
    states[arg] = function(cb) {
      return this;
    };
    handlers.push(
      (function() {
        var [handlerName, ...data] = Array.prototype.slice.call(arguments);
        states[handlerName].apply(mainCb, data);
      }).bind(this, arg)
    );
  });
  return states;
}
