const mongoose = require('mongoose');

/**
 * Schema
 */
const relationshipSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  defendant: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  state: { // -1 - blocked; 0 - sent frindship request; 1 - is friend
    type: Number,
    required: true
  }
}, {
  usePushEach: true,
});

/**
 * Static methods
 */
relationshipSchema.statics = {

  /**
   * Send request to freindship
   */
  async sendFriendshipRequest(initiator, defendant) {
    const request = await this.findOne({
      $or: [
        {$and: [
            { initiator },
            { defendant }
          ]
        },
        {$and: [
            { initiator: defendant },
            { defendant: initiator }
          ]
        }
      ]
    }); //@TODO Сonsider black list rules

    if (!(request instanceof Object)) { // Create request
      const newRequest = new this({
        initiator,
        defendant,
        state: 0
      });
      return await newRequest.save();
    }

    if (request.initiator == defendant && request.state == 0) { // If defendant already wants to friendship
      request.state = 1;
      await request.save();
    }
  },
};

mongoose.model('Relationship', relationshipSchema);