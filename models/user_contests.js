'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_contests extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user_contests.belongsTo(models.contests,{foreignKey:"contest_id"})
     //user_contests.belongsTo(models.contests,{foreignKey:"contest_id ",targetKey: 'id'})
     user_contests.belongsTo(models.private_contest_join,{foreignKey:"id",targetKey: 'user_contest_id'})
    }
    
  }
  user_contests.init({
    user_id: DataTypes.INTEGER,
    contest_id: DataTypes.INTEGER,
    contest_name: DataTypes.STRING,
    invite_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user_contests',
  });
  return user_contests;
};