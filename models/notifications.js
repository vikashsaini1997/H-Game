'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class notifications extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       notifications.belongsTo(models.User, { foreignKey: "user_id",  targetKey: 'id' });
       
    }
  }
  notifications.init({
    user_id: DataTypes.INTEGER,
    notification_type: DataTypes.INTEGER,
    title: DataTypes.STRING,
    notification: DataTypes.STRING,
    extra_data: DataTypes.STRING,
    status: DataTypes.INTEGER,
    

  }, {
    sequelize,
    modelName: 'notifications',
  });
  return notifications;
};