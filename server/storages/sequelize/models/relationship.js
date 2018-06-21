'use strict';
module.exports = (sequelize, DataTypes) => {
  const Relationship = sequelize.define('Relationship', {
    initiatorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    defendant: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    state: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    }
  }, {});
  Relationship.associate = function(models) {
  };
  return Relationship;
};