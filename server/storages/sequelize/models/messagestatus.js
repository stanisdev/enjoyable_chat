'use strict';
module.exports = (sequelize, DataTypes) => {
  const MessageStatus = sequelize.define('MessageStatus', {
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    }
  }, {});
  MessageStatus.associate = function(models) {
  };
  return MessageStatus;
};