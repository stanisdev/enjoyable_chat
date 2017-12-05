
/**
 * Base ctrl
 */
module.exports = (app) => {

  /**
   * Home action
   */
  app.get('/', function(req, res) {
    res.render('base/index.html');
  });
};
