const path = require('path');
const glob = require('glob');

const pathes = glob.sync(path.join(__dirname, '/*.js')).filter((m) => !m.endsWith('index.js'));
let filters = {};
pathes.forEach((_path) => {
  const filter = require(_path);
  const filterName = path.basename(_path, '.js');

  filters = Object.assign({
    [filterName]: filter,
  }, filters);
});

module.exports = filters;
