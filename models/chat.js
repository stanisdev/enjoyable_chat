
/**
 * Chat model
 */
module.exports = (mongoose) => {

  const chatSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Chat name length too short"],
      maxlength: [50, "Chat name length too long"]
    },
    type: {
      type: Number,
      default: 0
    },
    members: [{
      _id: false,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      role: {
        type: Number,
        default: 0
      }
    }],
    messages: [{
      type: mongoose.Schema.ObjectId,
      ref: 'Message'
    }],
    created_at: {
      type: Date,
    }
  });

  /**
   * Static chats methods
   */
  chatSchema.statics = {

    /**
     * Get list of my chats
     */
    getMyChats(userId) {
      return new Promise(async (resolve, reject) => {

        let [chats, membersCount] = await Promise.all([
          this.find({
            members: {
              $elemMatch: { user: userId }
            }
          })
          .select('name')
          .limit(10)
          .skip(0),

          // Of course we could count 'membersCount' using existing value 'members[]' through JS. But aggregation more interesting :)
          this.aggregate([
            { $match: {
                members: {
                  $elemMatch: { user: userId }
                }
              }
            },
            { $project: {
                item: 1,
                count: { $size: "$members" }
              }
            }
          ])
        ]);

        // Combine result
        membersCount.forEach(({_id, count}) => {
          chats = chats.map(chat => {
            if (chat._id.toString() == _id) {
              chat.membersCount = count;
            }
            return chat;
          });
        });
        resolve(chats);
      });
    }
  };

  /**
   * Pre saving hook
   */
  chatSchema.pre('save', function(next) {
    if (this.isNew) {
      this.created_at = new Date();
    }
    next();
  })

  mongoose.model('Chat', chatSchema);
};
