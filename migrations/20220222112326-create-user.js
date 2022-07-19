'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      username: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      mob_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      is_verify: {
        type: Sequelize.BOOLEAN,
        allowNull:true,
        comment:'mobile number verify'
      },
      otp: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      dob: {
        allowNull: true,
        type: Sequelize.STRING
      },
      role_id: {
        type: Sequelize.ENUM,
        values: ['1', '2', '3'],
        comment:'1 = Admin, 2 = Subadmin, 3 = User'
      },
      password: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      T_C: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      status: {
        allowNull: false,
        comment:'0 = inactive, 1 = active',
        defaultValue:"0",
        type: Sequelize.INTEGER
      },
      token: {
        allowNull: true,
        type: Sequelize.STRING
      },
      auth_token: {
        allowNull: true,
        comment:'user authentication',
        type: Sequelize.STRING
      },
      profile_image: {
        defaultValue:"",
        type: Sequelize.STRING
      },
      fb_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },  
      google_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      state_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      device_token: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      last_login: {
        allowNull: true,
        type: Sequelize.STRING,
        comment:'0 = not login, 1 = login',
      },
      access_modules: {
        allowNull: true,
        type: Sequelize.STRING
      },
      fb_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },  
      google_id: {
        allowNull: true,
        type: Sequelize.STRING,
      }, 
      cash_balance:{
        allowNull: true,
        type: Sequelize.STRING,
      },
      bonus_amount:{
        allowNull: true,
        type: Sequelize.STRING,
        comment:'signup bonus',
      },
      winning_balance:{
        allowNull: true,
        type: Sequelize.STRING,
      },
      current_balance:{
        allowNull: true,
        type: Sequelize.STRING,
      },
      contactId: {
        allowNull: true,
        comment:'razorpay contact ID',
        type: Sequelize.STRING
      },
      fundaccountid: {
        allowNull: true,
        comment:'razorpay fund account ID',
        type: Sequelize.STRING
      },
      current_location: {
        defaultValue:"",
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};