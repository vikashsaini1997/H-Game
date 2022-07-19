'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      transactions.belongsTo(models.User, { foreignKey: "user_id",  targetKey: 'id' });
    }
  }
  transactions.init({
    user_id: DataTypes.INTEGER,
    txn_id: DataTypes.STRING,
    txn_date: DataTypes.STRING,
    txn_time: DataTypes.STRING,
    txn_amount: DataTypes.STRING,
    added_type: DataTypes.STRING,
    payout_status:DataTypes.STRING,
    status: DataTypes.STRING,
    payout_response:DataTypes.TEXT,
    message_type:DataTypes.STRING,
    local_txn_id:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'transactions',
  });
  return transactions;
};