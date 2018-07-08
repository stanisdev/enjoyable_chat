module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [1, 30],
      },
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: [6, 60],
      },
      unique: true,
    },
    password: {
      type: DataTypes.CHAR(60),
      validate: {
        len: 60,
      },
      allowNull: false,      
    },
    salt: {
      type: DataTypes.CHAR(20),
      validate: {
        len: 20,
      },
      allowNull: false,
    },
    age: {
      type: DataTypes.SMALLINT,
      validate: {
        isInt: true,
        max: 140,
        min: 18,
      },
      allowNull: false,
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