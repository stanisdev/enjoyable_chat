
/**
 * Mesage model
 */
module.exports = (mongoose) => {

  const messageSchema = new mongoose.Schema({
    content: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat'
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    statuses: [{
      _id: false,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      value: { // 0 - sended, 1 - delivered, 2 - received
        type: Number
      }
    }],
    created_at: {
      type: Date,
    }
  });

  /**
   * Static message methods
   */
  messageSchema.statics = {

    /**
     * Get messages by chat
     */
    getMessagesByChat(chatId, userId) {
      return new Promise(async (resolve, reject) => {

        var messages;
        try {
          messages = await this.aggregate([
            { $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author"
              }
            },
            { $match: {
                chat: mongoose.Types.ObjectId(chatId),
                statuses: {
                  $elemMatch: { user: mongoose.Types.ObjectId(userId) }
                }
              }
            },
            { $unwind: "$statuses" },
            { $unwind: "$author" },
            { $match: { "statuses.user": mongoose.Types.ObjectId(userId) } },
            { $project: {
                content: 1, type: 1, "author._id": 1, "author.name": 1, created_at: 1, "statuses.value": 1
              }
            },
            { $limit: 10 }, // @TODO Place to config file
            { $skip: 0 }
          ])
          .exec();
        } catch (err) {
          return reject(err);
        }
        resolve(messages);
      });
    },

    /**
     * New message
     */
    async createMessage(chatId, authorId, content, members) {
      const statuses = members.map(member => {
        return {
          user: member.user,
          value: (member.user.toString() == authorId ? 2 : 0)
        };
      });
      const message = new this({
        content,
        type: 'text/plain',
        chat: chatId,
        author: authorId,
        statuses
      });
      return message.save();
    }
  };

  /**
   * Help schema do some actions before saving
   */
  messageSchema.pre('save', function(next) {
    if (this.isNew) {
      this.created_at = new Date();
    }
    next();
  });

  mongoose.model('Message', messageSchema);
};
