'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.CHAR(60),
    },
    salt: {
      type: DataTypes.CHAR(20),
      allowNull: false,
    },
    age: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
    },
    blocked: {
      type: DataTypes.BOOLEN,
      allowNull: false,
      defaultValue: false,
    },
    state: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0, // 0 - not activated, 1 - activated
    },
    last_login: {
      type: DataTypes.DATE,
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};