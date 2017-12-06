const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

/**
 * User model
 */
module.exports = (mongoose) => {

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
    created_at: {
      type: Date,
    }
  });

  userSchema.pre('save', function(next) {
    this.salt = randomstring.generate(10);
    this.password = bcrypt.hashSync(this.password + this.salt, bcrypt.genSaltSync(10));
    this.created_at = new Date();
    next();
  });

  mongoose.model('User', userSchema);
};
