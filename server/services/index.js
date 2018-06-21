const path = require('path');
const glob = require('glob');

const pathes = glob.sync(path.join(__dirname, '/*.js')).filter((m) => !m.endsWith('index.js'));
let services = {};
pathes.forEach((_path) => {
  const service = require(_path);
  const serviceName = path.basename(_path, '.js');

  services = Object.assign({
    [serviceName]: service,
  }, services);
});

module.exports = services;
