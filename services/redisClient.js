const redis = require("redis");
const bluebird = require("bluebird");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient({
  host: '127.0.0.1',
  port: '6379',
  db: 0
});

client.on("error", function (err) {
  console.log("Redis Client error " + err);
});

module.exports = client;