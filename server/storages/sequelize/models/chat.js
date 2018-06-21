'use strict';
module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
  });
  Chat.associate = function(models) {
    // associations can be defined here
  };
  return Chat;
};