const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

/**
 * User model
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "Name length too short"],
    maxlength: [30, "Name length too long"]
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: [6, "Email length too short"],
    maxlength: [60, "Email length too long"]
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  salt: {
    type: String
  },
  age: {
    type: Number,
    required: true
  },
  state: {
    type: Number,
    default: 0
  },
  chats: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Chat'
  }],
  lastLogin: {
    type: Date
  },
  created_at: {
    type: Date
  }
});

/**
 * Instance methods
 */
userSchema.methods = {

  /**
   * Compare user's password with hash
   */
  isPasswordValid(password) {
    return bcrypt.compareSync(password + this.salt, this.password);
  }
};

/**
 * Static methods
 */
userSchema.statics = {

  /**
   * Find user with active = 1 state
   */
  findActiveUser(userId) {
    return this.findOne({
      _id: userId,
      state: 1
    })
    .exec();
  }, 

  /**
   * Find users
   */
  async findAllByQuery(query, currUserId) {
    const selector = {
      state: 1, 
      _id: {
        $ne: currUserId
      }
    };
    if (typeof query == 'string' && query.length > 0) {
      selector.name = new RegExp(`${query}`, 'i');
    }
    var users = await this.find(selector, 'name age lastLogin').exec();
    const ids = users.map(user => user._id.toString());

    const rels = await mongoose.model('Relationship').find({
      $or: [
        { $and: [
            { initiator: currUserId },
            { defendant: { $in: ids } }
          ]
        }, 
        { $and: [
            { initiator: { $in: ids } },
            { defendant: currUserId },
            { state: 1 }
          ]
        }
      ]
    }, {
      initiator: 1, defendant: 1, state: 1, _id: 0 
    });
    
    // Find and set relationships
    users = users.map((user) => {
      let userId = user._id.toString();

      for (let i = 0; i < rels.length; i++) {
        const rel = rels[i];
        let [initiatorId, defendantId] = [rel.initiator.toString(), rel.defendant.toString()];
        
        if (rel.state == 1 && (defendantId == userId || initiatorId == userId)) {
          user.isFriend = true;
          break;
        }
        if (rel.state == 0 && defendantId == userId) {
          user.requestSent = true;
        }
      }
      return user;
    });

    return users;
  },

  /**
   * Check is user is my friend
   */
  isFriend(currUserId, friendId) {
    return mongoose.model('Relationship').count({
      $or: [
        {$and: [
            { initiator: currUserId },
            { defendant: friendId }
          ]
        },
        {$and: [
            { initiator: friendId },
            { defendant: currUserId }
          ]
        }
      ],
      state: 1
    }).exec();
  },

  /**
   * Find user's friends
   */
  async getFriends(userId) {
    const rels = await mongoose.model('Relationship').find({
      $or: [
        { defendant: userId },
        { initiator: userId }
      ],
      state: 1
    }, 'initiator defendant').exec();

    const friendsIds = rels.map((rel) => {
      return rel.initiator.toString() == userId ? rel.defendant : rel.initiator; 
    });

    // Extract friends info
    return await this.find({
      _id: { $in: friendsIds },
      state: 1
    }, 'name age lastLogin').exec();
  }
};

/**
 * Method is called before creating or updating user
 */
userSchema.pre('save', function(next) {
  if (this.isNew) { // Creation
    this.salt = randomstring.generate(10);
    this.password = bcrypt.hashSync(this.password + this.salt, bcrypt.genSaltSync(10));
    this.created_at = new Date();
  } else { // Updating
  }
  next();
});

mongoose.model('User', userSchema);