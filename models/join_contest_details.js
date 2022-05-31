'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class join_contest_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      join_contest_details.belongsTo(models.contests,{foreignKey:"contest_id",targetKey: 'id'})
      join_contest_details.hasOne(models.player_team_contest,{foreignKey:"join_contest_id",targetKey: 'id'})
      join_contest_details.belongsTo(models.User,{foreignKey:"user_id"})
    }
  }
  join_contest_details.init({
    user_id: DataTypes.INTEGER,
    contest_id: DataTypes.INTEGER,
    total_amount: DataTypes.INTEGER,
    win_status:DataTypes.INTEGER,
    cash_balance:DataTypes.INTEGER,
    winning_balance:DataTypes.STRING,
    bonus_amount:DataTypes.STRING,
    time:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'join_contest_details',
  });
  return join_contest_details;
};