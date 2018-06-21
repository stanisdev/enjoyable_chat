const app = require(process.env.app_file);

module.exports = () => {
  /**
   * 404 Page not found
   */
  app.use((req, res, next) => {
    res.json({
      success: false,
      message: 'Not found',
    });
  });

  /**
   * Server error handler
   */
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.json({
      success: false,
      message: 'Unexpected Error',
    });
  });
};
