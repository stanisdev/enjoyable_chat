'use strict';
module.exports = (sequelize, DataTypes) => {
  var Message = sequelize.define('Message', {
    content: DataTypes.TEXT,
    type: DataTypes.STRING,
    chatId: DataTypes.UUID,
    userId: DataTypes.UUID
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
  };
  return Message;
};