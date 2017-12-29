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
  },
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