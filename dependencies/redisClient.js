const bluebird = require('bluebird');

// Singleton
const Client = (function() {
  var instance;

  return function() {
    if (typeof instance == 'undefined') {

      let redis = require("redis");
      bluebird.promisifyAll(redis.RedisClient.prototype);
      bluebird.promisifyAll(redis.Multi.prototype);
      instance = redis.createClient();
  
      instance.on("error", function (err) {
        console.log("Error " + err);
      });
    }
    return instance;
  };
})();

module.exports.getClient = Client;
