'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      category.hasMany(models.contests,{foreignKey:"id",targetKey: 'category_id'})
    }
  }
  category.init({
    random_id:DataTypes.STRING,
    category_name: DataTypes.STRING,
    title_name: DataTypes.STRING,
    categroy_image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'category',
  });
  return category;
};