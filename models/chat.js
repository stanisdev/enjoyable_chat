const mongoose = require('mongoose');

/**
 * Chat model
 */
const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, "Chat name length too short"],
    maxlength: [50, "Chat name length too long"]
  },
  type: { // 0 - individual, 1 - group
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
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
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
   * Find individual chat
   */
  findChatByMembers(userFirst, userSecond) {
    return this.findOne({
      $and: [
        { members: {
            $elemMatch: {
              user: userFirst
            }
          } 
        },
        { members: {
            $elemMatch: {
              user: userSecond
            }
          } 
        }
      ],
      type: 0
    }).exec();
  },

  /**
   * Create new individual chat
   */
  createIndividualChat(users, options = {}) {
    const members = users.map((user) => {
      return {
        user,
        role: 0,
        is_deleted: false
      };
    });
    options.type = 0;
    const chat = Object.assign({ members }, options);
    return (new this(chat)).save();
  },

  /**
   * Get list of my chats
   */
  async getMyChats(userId) {
    let [chats, membersCount] = await Promise.all([
      this.find({
        members: {
          $elemMatch: {
            user: userId
          }
        }
      })
      .select('name')
      .limit(10)
      .skip(0),

      // Of course we could count 'membersCount' using existing value 'members[]' through JS. But aggregation more interesting :)
      this.aggregate([{
          $match: {
            members: {
              $elemMatch: {
                user: userId
              }
            }
          }
        },
        { $project: {
            item: 1,
            count: {
              $size: "$members"
            }
          }
        }
      ])
    ]);

    // Combine result
    membersCount.forEach(({ _id, count }) => {
      chats = chats.map(chat => {
        if (chat._id.toString() == _id) {
          chat.membersCount = count;
        }
        return chat;
      });
    });
    return chats;
  },

  /**
   * Get members by chatId
   */
  async getMembers(chatId) {
    const {members} = await this.findOne({
      _id: chatId,
      members: {
        $elemMatch: {
          is_deleted: false
        }
      }
    }, {
      _id: 0,
      "members.user": 1
    });
    return members.map(member => {
      return {
        userId: member.user.toString()
      };
    });
  }
};

/**
 * Pre saving hook
 */
chatSchema.pre('save', function (next) {
  if (this.isNew) {
    this.created_at = new Date();
  }
  next();
});

mongoose.model('Chat', chatSchema);