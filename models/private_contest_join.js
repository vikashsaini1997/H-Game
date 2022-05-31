'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class private_contest_join extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      private_contest_join.belongsTo(models.User, { foreignKey: "user_id",  targetKey: 'id' });
      private_contest_join.belongsTo(models.user_contests, { foreignKey: "user_contest_id",  targetKey: 'id' });
    }
  }
  private_contest_join.init({
    contest_id: DataTypes.STRING,
    user_contest_id: DataTypes.STRING,
    user_id: DataTypes.STRING,
    host:DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'private_contest_join',
  });
  return private_contest_join;
};