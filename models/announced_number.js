'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class announced_number extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  announced_number.init({
    contest_id: DataTypes.STRING,
    announced_number: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'announced_number',
  });
  return announced_number;
};