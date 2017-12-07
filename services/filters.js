module.exports = {

  auth(req, res, next) {
    if (!(req.user instanceof Object)) {
      return res.redirect('/');
    }
    next();
  }
};