const Joi = require('joi');

module.exports = {

  /**
   * Auth filter
   */
  auth(req, res, next) {
    if (!(req.user instanceof Object)) {
      return res.redirect('/');
    }
    next();
  },

  /**
   * POST-data, URL-validator
   */
  incomingDataValidation(schema) {
    return (req, res, next) => {
      if (schema.hasOwnProperty('body') && !validateJoiSchema(req.body, schema.body, res)) {
        return;
      } else if (schema.hasOwnProperty('url') && !validateJoiSchema(req.params, schema.url, res)) {
        return;
      }
      next();
    };
  },

  /**
   * Check that user chat member
   */
  isChatMember(db) {
    return async (req, res, next) => {

      const chatId = req.params.id;
      const chat = await db.model('Chat').findOne({
        _id: chatId,
        members: {
          $elemMatch: {
            user: req.user.id,
            is_deleted: false
          }
        }
      }, '_id name');
      if (!(chat instanceof Object)) {
        return res.json({
          success: false,
          message: 'Chat not found'
        });
      }
      req.chat = chat;
      next();
    };
  }
};

function validateJoiSchema(inputData, schema, res) {
  const { error } = Joi.validate(inputData, schema);

  if (error !== null) {
    const message =
      error instanceof Object && Array.isArray(error.details) && error.details.length > 0 && error.details[0] instanceof Object ?
      error.details[0].message :
      '';
    res.status(400).json({
      success: false,
      message: message.replace(/\"/g, '')
    });
    return false;
  }
  return true;
}
