const mongoose = require('mongoose');

/**
 * Schema
 */
const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }, 
  type: {
    type: Number, 
    required: true
  }
}, {
  usePushEach: true,
});