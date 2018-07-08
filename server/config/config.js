const path = require('path');
const serverDir = path.dirname(__dirname);
const fs = require('fs');
const privateKey = fs.readFileSync(path.join(__dirname, '/private.key'));
const storage = process.STORAGE || 'sequelize';

const config = {
  server_dir: serverDir,
  routes_path: path.join(serverDir, '/routes'),
  filters_path: path.join(serverDir, '/filters'),
  services_path: path.join(serverDir, '/services'),
  middlewares_path: path.join(serverDir, '/middlewares'),
  storages_path: path.join(serverDir, '/storages'),  
  config_path: __dirname,
  private_key: privateKey.toString(),
  enabled_storage: ['sequelize', 'mongoose'],
};

if (!config.enabled_storage.includes(storage)) {
  throw new Error('Storage not added to enabled list');
  process.exit(1);
}
config.storage = storage;

module.exports = config;