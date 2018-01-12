const db = require('mongoose');

module.exports = {

  /**
   * Check that user is chat member
   */
  async isChatMember(ctx, next) {
    const chat = await db.model('Chat').findChatWithMemberId(ctx.params.id, ctx.state.user._id);
    if (!(chat instanceof Object)) {
      ctx.flash.message = 'Chat not found';
      return ctx.redirect('/chats');
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