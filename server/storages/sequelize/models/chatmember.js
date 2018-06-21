'use strict';
module.exports = (sequelize, DataTypes) => {
  var ChatMember = sequelize.define('ChatMember', {
    chatId: DataTypes.UUID,
    userId: DataTypes.UUID,
    role: DataTypes.INTEGER,
    isDeleted: DataTypes.BOOLEAN
  }, {});
  ChatMember.associate = function(models) {
    // associations can be defined here
  };
  return ChatMember;
};