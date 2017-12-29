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
    })
  },
  /**
   * Post-data validators
   */
  body: {}
};