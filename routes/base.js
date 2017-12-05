
/**
 * Base ctrl
 */
module.exports = (app, wrapper, config) => {
  const db = app.get('db');

  /**
   * Home action
   */
  app.get('/', wrapper(async (req, res) => {
    const user = await db.model('User').findOne({ name: 'Stan' });
    console.log(user.name);
    res.render('base/index.html');
  }));
};
