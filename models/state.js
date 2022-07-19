'use strict';
const { database } = require('firebase-admin');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class state extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // state.hasMany(models.User, {  foreignKey: 'id',targetkey: 'state_id' });
    }
  }
  state.init({
    state_name: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'state',
  });
  return state;
};