require('dotenv').config();
const Koa = require('koa');
const app = new Koa();

const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const debug = require('debug')('koa2:server');
const path = require('path');
const glob = require("glob");

const routes = glob.sync(path.join(__dirname, '/routes/*.js'));
require(path.join(__dirname, '/services/session'))(app);

// Error handler
onerror(app);

// Middlewares
app.use(bodyparser())
  .use(json())
  .use(logger())
  .use(require('koa-static')(__dirname + '/public'))
  .use(views(path.join(__dirname, '/views'), {
    options: {
      settings: {
        views: path.join(__dirname, 'views')
      }
    },
    map: {
      'njk': 'nunjucks'
    },
    extension: 'njk'
  }));

// Passport init
require(path.join(__dirname, '/services/passport'));
const passport = require('koa-passport');
app.use(passport.initialize());
app.use(passport.session());

module.exports = app;

process.env.ROOT_DIR = __dirname;
require('./models');

// Routes
routes.forEach(route => {
  let router = require(route);
  app
    .use(router.routes())
    .use(router.allowedMethods());
});

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
require('./services/sockets')(io, app);

// Logger
app.use(async(ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - $ms`);
});

app.on('error', function (err, ctx) {
  console.log('Server error', err);
  console.log(err);
});

process.on('unhandledRejection', err => {
  console.log('Unhandled promise rejection');
  console.log(err);
});

server.listen(process.env.PORT, () => {
  console.log(`Chat app listening on port ${process.env.PORT}`);
});