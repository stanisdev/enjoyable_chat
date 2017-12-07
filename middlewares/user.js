module.exports = (app) => {

  /**
   * Find user by id
   */
  return async function(req, res, next) {
    if (req.session instanceof Object && typeof req.session.userId == 'string') {
      const user = await app.get('db').model('User').findOne({
        _id: req.session.userId, 
        state: {
          $gt: 0
        }
      }, 'name email state');
      if (user instanceof Object) {
        req.user = user;
      }
    }
    next();
  };
};