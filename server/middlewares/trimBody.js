const app = require(process.env.app_file);
const trimBody = require('trim-body');

app.use((req, res, next) => {
  if (typeof req.method == 'string' &&
    req.method.toLowerCase() === 'post' &&
    req.body instanceof Object) {
    trimBody(req.body);
  }
  next();
});
