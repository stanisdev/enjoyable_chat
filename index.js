const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
var config = require(__dirname + '/dependencies/config.json');
const appAssembly = require(__dirname + '/dependencies/assembly');
const port = process.env.PORT || config.app.port;
const glob = require('glob');
const { promisify } = require('util');
const { join } = require('path');

config = Object.assign(config, { root_dir: __dirname });
app.set('config', config);
appAssembly.initMorgan(app);

app.use(express.static(join(__dirname, 'public')));
nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: true
});

const models = require(__dirname + '/models')(config);

// Load app dependencies
Promise.all([
  promisify(glob)("routes/*.js"),
  models.connect()
]).then(data => {
  const [files, db] = data;

  app.set('db', db);

  // Load routes
  files.forEach(file => {
    require(join(__dirname, file))(app, appAssembly.wrapper, config);
  });
  appAssembly.errorHandlers(app);

  app.listen(port, () => {
    console.log(`Enjoyable Chat app listening on port ${port}`);
    appAssembly.painLog();
  });

}).catch(err => {
  console.error(err);
});
