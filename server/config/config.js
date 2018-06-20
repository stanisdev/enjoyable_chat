const path = require('path');
const serverDir = path.dirname(__dirname);

module.exports = {
  server_dir: serverDir,
  routes_path: path.join(serverDir, '/routes'),
  filters_path: path.join(serverDir, '/filters'),
  services_path: path.join(serverDir, '/services'),
  middlewares_path: path.join(serverDir, '/middlewares'),
  config_path: __dirname,
};