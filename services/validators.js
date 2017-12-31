const validate = require('koa2-validation');
const Joi = require('joi');

module.exports = {
  /**
   * Url-validators
   */
  url: {
    hasObjectId: validate({
      params: {
        id: Joi.string().regex(/^[0-9abcdef]{24}$/g).required()
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
  body: {}
};