'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        // user_setting.belongsTo(models.User, { foreignKey: "user_id"});
    }
  }
  user_setting.init({
    user_id: DataTypes.INTEGER,
    color: DataTypes.STRING,
    gameboardsound: DataTypes.BOOLEAN,
    overallgamesound: DataTypes.BOOLEAN,
    language: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'user_setting',
  });
  return user_setting;
};