'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatMember = sequelize.define('ChatMember', {
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    }
  }, {});
  ChatMember.associate = function(models) {
  };
  return ChatMember;
};