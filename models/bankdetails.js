'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bankdetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  bankdetails.init({
    user_id: DataTypes.INTEGER,
    account_holder_name: DataTypes.STRING,
    bank_name: DataTypes.STRING,
    account_number: DataTypes.STRING,
    ifsc_code: DataTypes.STRING,
    is_acitve:DataTypes.INTEGER

  }, {
    sequelize,
    modelName: 'bankdetails',
  });
  return bankdetails;
};