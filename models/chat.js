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
  createChat(users, options = {}) {
    var members = {};
    if (Array.isArray(users)) {
      members = users.map((user) => {
        return {
          user,
          role: 0,
          is_deleted: false
        };
      });
    }
    const chat = Object.assign({ members }, options);
    return (new this(chat)).save();
  },

  /**
   * Get list of my chats
   */
  async getMyChats(userId) {
    const chats = (await this.find({
      members: {
        $elemMatch: {
          user: userId
        }
      }
    })
    .select('name type members')
    .limit(10)
    .skip(0))
    .map((chat) => {
      if (Array.isArray(chat.members)) {
        chat.membersCount = chat.members.length;
      }
      return chat;
    });
    
    // Get name of interlocutor and set as chat's name
    const individualChats = chats.filter((chat) => chat.type == 0);
    await Promise.all([
      Promise.all(
        individualChats.map(async (chat) => {
  
          // Find interlocutor
          for (let i = 0; i < chat.members.length; i++) {
            let interlocutorId = chat.members[i].user.toString();
            if (interlocutorId != userId) {
              
              let {name} = await mongoose.model('User').findOne({
                _id: interlocutorId
              }, 'name');
              chat.name = name;
              break;
            }
          }
          return 1;
        })
      ),
  
      // Find last message
      Promise.all(
        chats.map(async (chat) => {
  
          const message = await mongoose.model('Message').findOne({
            chat: chat._id
          }, 'content type')
          .sort({ created_at: 'desc' });
          if (message instanceof Object) {
            chat.lastMessage = message.content.substr(0, 50);
          }
        })
      )
    ]);
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