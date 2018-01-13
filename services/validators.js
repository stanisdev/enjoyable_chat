const validate = require('koa2-validation');
const Joi = require('joi');

const validators = {
  objectId: Joi.string().regex(/^[0-9abcdef]{24}$/g).required()
};

module.exports = {
  /**
   * Url-validators
   */
  url: {
    hasObjectId: validate({
      params: {
        id: validators.objectId
      }
    }), 
    hasType: validate({
      params: {
        type: Joi.number().min(-1).max(1).required()
      }
    })
  },
  /**
   * Post-data validators
   */
  body: {
    hasIds: validate({
      body: {
        ids: Joi.array().min(1).items(validators.objectId).required()
      }
    }),
    hasStatus: validate({
      body: {
        status: Joi.number().min(1).max(2).required()
      }
    })
  },
  /**
   * For other cases
   */
  custom: {
    objectId: (value) => Joi.validate(value, validators.objectId)
  }
};