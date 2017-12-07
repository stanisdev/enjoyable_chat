
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
    created_at: {
      type: Date,
    }
  });

  chatSchema.pre('save', function(next) {
    this.created_at = new Date();
    next();
  })

  mongoose.model('Chat', chatSchema);
};
