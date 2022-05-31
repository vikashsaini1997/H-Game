'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_doc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      user_doc.belongsTo(models.User, { foreignKey: "user_id", targetKey:"id"});
      user_doc.belongsTo(models.bankdetails, { foreignKey: "user_id",targetKey:"user_id" });
    }
  }
  user_doc.init({
    user_id: DataTypes.INTEGER,
    pan_card_no: DataTypes.STRING,
    doc_image: DataTypes.STRING,
    pan_card_name: DataTypes.STRING,
    dob: DataTypes.STRING,
    state: DataTypes.STRING,
    aadhar_card_name: DataTypes.STRING,
    aadhar_card_no: DataTypes.STRING,
    is_verified: DataTypes.INTEGER,

  }, {
    sequelize,
    modelName: 'user_doc',
  });
  return user_doc;
};