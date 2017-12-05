const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
var config = require(__dirname + '/config.json');
const port = process.env.PORT || config.app.port;
const glob = require('glob');
const util = require('util');
const path = require('path');

config = Object.assign(config, { root_dir: __dirname });

app.use(express.static(path.join(__dirname, 'public')));
nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: true
});

// Load routes
util.promisify(glob)("routes/*.js").then(files => {
  if (!Array.isArray(files)) {
    throw new Error('Routes cannot be loaded');
  }

  files.forEach(file => {
    require(path.join(__dirname, file))(app);
  });

  const mongoose = require(__dirname + '/models')(config);
  console.log(mongoose.connect);

  // Errors handler
  app.use(function (err, req, res, next) {
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
  app.listen(port, () => console.log(`Enjoyable Chat app listening on port ${port}`));

}).catch(err => {
  console.error(err);
});
