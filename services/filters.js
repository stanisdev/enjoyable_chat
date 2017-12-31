const db = require('mongoose');

module.exports = {

  /**
   * Check that user is chat member
   */
  async isChatMember(ctx, next) {
    const chat = await db.model('Chat').findOne({
      _id: ctx.params.id,
      members: {
        $elemMatch: {
          user: ctx.state.user._id,
          is_deleted: false
        }
      }
    }, '_id name');

    if (!(chat instanceof Object)) {
      return ctx.redirect('/'); // @TODO add flash message
    }
    ctx.chat = chat;
    await next();
  },

  /**
   * Check is user exists
   */
  async isUserExists(ctx, next) {
    const total = await db.model('User').count({
      _id: ctx.params.id
    }).exec();
    if (total < 1) {
      return ctx.throw(400, 'User not found');
    }
    next();
  }
};