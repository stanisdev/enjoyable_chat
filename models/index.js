const mongoose = require('mongoose');
const bluebird = require('bluebird');
const glob = require('glob');
const path = require('path');
const EventEmitter = require('events');
const emitter = new EventEmitter();

mongoose.Promise = bluebird;
if (process.env.DB_LOGGING === 'true') {
  mongoose.set('debug', true);
}
const connection = {
  params: `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  options: {
    useMongoClient: true,
    promiseLibrary: bluebird
  }
};

/**
 * Connection
 */
(async () => {
  await mongoose.connect(connection.params, connection.options);
  console.log('DB connected successfully');
  
  // Include models
  let modelsPath = path.join(process.env.ROOT_DIR, "models/**/!(index).js");
  const models = glob.sync(modelsPath);
  
  models.forEach(model => {
    require(model);
  });
  emitter.emit('done');
})();

module.exports = emitter;