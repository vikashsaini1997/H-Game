'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class player_team_contest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      player_team_contest.belongsTo(models.join_contest_details,{foreignKey:"join_contest_id",targetKey: 'id'})
    }
  }
  player_team_contest.init({
    join_contest_id: DataTypes.INTEGER,
    details: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'player_team_contest',
  });
  return player_team_contest;
};