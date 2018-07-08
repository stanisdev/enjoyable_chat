'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatMember = sequelize.define('ChatMember', {
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
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