const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.state, { foreignKey: "state_id",  targetKey: 'id' });
      User.hasMany(models.notifications,{foreignKey:"user_id"})
      User.hasOne(models.user_setting,{foreignKey:"user_id"});
      User.belongsTo(models.user_doc, { foreignKey: "id" ,targetKey: 'user_id'});
      User.belongsTo(models.bankdetails, { foreignKey: "id",targetKey: 'user_id' });

    }
  }
  User.init({
    role_id:DataTypes.INTEGER,
    is_verify:DataTypes.BOOLEAN,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    mob_no: DataTypes.STRING,
    username: DataTypes.STRING,  
    password: DataTypes.STRING,
    role_id: DataTypes.STRING,
    otp: DataTypes.STRING,
    dob:DataTypes.STRING,
    state_id: DataTypes.INTEGER,
    profile_image: DataTypes.STRING,
    fb_id: DataTypes.STRING,
    google_id: DataTypes.STRING,
    status:DataTypes.STRING,
    token:DataTypes.STRING,
    auth_token:DataTypes.STRING,
    T_C:DataTypes.INTEGER,
    device_token:DataTypes.TEXT,
    last_login:DataTypes.STRING,
    access_modules:DataTypes.STRING,
    cash_balance:DataTypes.STRING,
    bonus_amount:DataTypes.STRING,
    winning_balance:DataTypes.STRING,
    current_balance:DataTypes.STRING,
    is_verify: DataTypes.BOOLEAN,
    fb_id:DataTypes.STRING,
    google_id:DataTypes.STRING,
    contactId:DataTypes.STRING,
    fundaccountid:DataTypes.STRING,
    current_location:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};