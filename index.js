const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
var config = require(__dirname + '/dependencies/config.json');
const appAssembly = require(__dirname + '/dependencies/assembly');
const port = process.env.PORT || config.app.port;
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { join, basename } = require('path');
const bodyParser = require('body-parser');

config = Object.assign(config, { root_dir: __dirname });
app.set('config', config);
appAssembly.initMorgan(app);
appAssembly.sessionConnection(app, config);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));

nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: true
});

const models = require(__dirname + '/models')(config);

// Build app structure
Promise.all([
  glob("routes/*.js"),
  models.connect(),
  glob("middlewares/*.js"),
  glob("services/*.js"),
]).then(data => {
  let [files, db, middlewares, services] = data;

  app.set('db', db);

  // Load middlewares
  middlewares = middlewares.reduce((result, path) => {
    result[ basename(path, '.js') ] = require(join(__dirname, path))(app);
    return result;
  }, {});

  app.use(middlewares.user);

  // Load services
  services = services.reduce((result, path) => {
    return (result[ basename(path, '.js') ] = require(join(__dirname, path)), result);
  }, {});

  // Load routes
  files.forEach(file => {
    require(join(__dirname, file))(app, appAssembly.wrapper, config, middlewares, services);
  });
  appAssembly.errorHandlers(app);

  app.listen(port, () => {
    console.log(`Enjoyable Chat app listening on port ${port}`);
    appAssembly.painLog();
  });

}).catch(err => {
  console.error(err);
});
