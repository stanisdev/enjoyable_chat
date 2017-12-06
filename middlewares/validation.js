const Joi = require('joi');

/**
 * Base ctrl
 */
module.exports = (app) => {

  /**
   * Middlewary body
   */
  return (schema) => {

    return (req, res, next) => {
      if (schema.hasOwnProperty('body')) {
        const { error } = Joi.validate(req.body, schema.body);

        if (error !== null) {
          const message =
            error instanceof Object && Array.isArray(error.details) && error.details.length > 0 && error.details[0] instanceof Object ?
            error.details[0].message :
            '';
          return res.status(400).json({
            success: false,
            message: message.replace(/\"/g, '')
          });
        }
      }
      next();
    };
  };
};
