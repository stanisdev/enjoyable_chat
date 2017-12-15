const Joi = require('joi');

/**
 * Primary url validators
 */
module.exports = {

  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },

  id: {
    url: {
      id: Joi.string().length(24).token().required()
    }
  }
};
