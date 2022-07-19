'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contests extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      contests.belongsTo(models.category, { foreignKey: "category_id",  targetKey: 'id' });
      contests.hasOne(models.user_contests,{foreignKey:"contest_id",targetKey: 'id'})
      contests.belongsTo(models.join_contest_details, { foreignKey: "id",  targetKey: 'contest_id' });
    }
  }
  contests.init({
    category_id: DataTypes.INTEGER,
    random_id:DataTypes.STRING,
    contest_type:DataTypes.INTEGER,
    admin_comission: DataTypes.STRING,
    winning_amount: DataTypes.STRING,
    contest_size: DataTypes.STRING,
    entry_fee: DataTypes.INTEGER,
    waiting_time: DataTypes.STRING,
    announced_numbers: DataTypes.TEXT,
    status:DataTypes.INTEGER,
    game_rule_number:DataTypes.STRING,
    end_time:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'contests',
  });
  return contests;
};