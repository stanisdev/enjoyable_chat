const mongoose = require('mongoose');
const glob = require('glob');
const bluebird = require('bluebird');
const util = require('util');
const path = require('path');

/**
 * Mongoose connection
 */
module.exports = (config) => {

  return {
    connect: () => {
      return new Promise(async (resolve, reject) => {

        mongoose.Promise = bluebird;
        mongoose.set('debug', true);
        const connection = {
          params: `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`,
          options: {
            useMongoClient: true,
            promiseLibrary: bluebird
          }
        };
        try {
          await mongoose.connect(connection.params, connection.options);
        } catch (err) {
          console.error('Error while connecting to DB');
          return reject(err);
        }
        console.log('DB connected successfully');

        // Load models
        try {
          let modelsPath = path.join(config.root_dir, "models/**/!(index).js");
          const models = await util.promisify(glob)(modelsPath);

          models.forEach(model => {
            require(model)(mongoose);
          });
          resolve(mongoose);
        } catch (err) {
          return reject(err);
        }
      });
    }
  };
};
