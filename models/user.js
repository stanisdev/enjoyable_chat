
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
    password: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: Number,
      default: 0
    }
  });

  mongoose.model('User', userSchema);
};
