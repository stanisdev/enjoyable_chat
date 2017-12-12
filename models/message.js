
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
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      value: {
        type: Number
      }
    }],
    created_at: {
      type: Date,
    }
  });

  mongoose.model('Message', messageSchema);
};
