const morgan = require('morgan');
const chalk = require('chalk');
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

/**
 * App assembly
 */
module.exports = {

  /**
   * Morgan logging
   */
  initMorgan(app) {
    app.use(morgan((tokens, req, res) => {
      let logData = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
      ].join(' ');
      return chalk.magenta(logData);
    }));
  },

  /**
   * Nunjucks init
   */
  errorHandlers(app) {
    // Errors handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500);
      if (app.get('env') == 'development') {
        res.render("dev_error.html", {
          message: err.message,
          error: err,
          title: "Error occurred"
        });
      } else {
        res.send('Something broken!');
      }
    });
    app.use((req, res) => res.status(404).send('Page not found'));
  },

  /**
   * Paint standart console.log
   */
  painLog() {
    const log = console.log;
    console.log = function(...args) {
      args = args.map(e => {
        if (typeof e != "string") {
          return e;
        }
        return chalk.yellow(e);
      });
      log.apply(log, args);
    };
  },

  /**
   * Route's wrapper
   */
  wrapper(handler) {
    return async function() {
      try {
        await handler.apply(handler, arguments);
      } catch (err) {
        if (arguments[1] instanceof Object) {
          arguments[1].send('Syntax error or unhandled promise rejection');
        }
        console.log(err);
      }
    };
  },

  /**
   * Route's wrapper
   */
  sessionConnection(app, config) {
    //@TODO put redis config to .json file
    app.use(session({
      store: new RedisStore({
        host: 'localhost',
        port: 6379,
        client: redis.createClient(),
        ttl: 260
      }),
      secret: 'strong-blah-blah-code',
      saveUninitialized: false,
      resave: false
    }));
  }
};
