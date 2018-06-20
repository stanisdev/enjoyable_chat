const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const glob = require('glob');
const helmet = require('helmet');
const path = require('path');
const configPath = path.join(__dirname, '/config/config.js');
const config = require(configPath);

process.env.app_file = path.join(__dirname, '/app.js');
process.env.config_path = configPath;

const app = express();
app.use(helmet());
app.set('config', config);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

module.exports = app;

/**
 * Middlewares
 */
const middlewares = glob.sync(path.join(config.middlewares_path, '/*.js'));
middlewares.forEach((middleware) => {
  require(middleware);
});

/**
 * Routes
 */
const routes = glob.sync(path.join(config.routes_path, '/**/**.js'));
routes.forEach((route) => {
  require(route);
});