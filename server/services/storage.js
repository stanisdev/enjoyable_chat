const path = require('path');
const config = require(process.env.config_path);
const {storage} = config;
const storagePath = path.join(config.storages_path, storage);
const db = require(storagePath);

module.exports = {
  model(name) {
    return db[name];
  },
};