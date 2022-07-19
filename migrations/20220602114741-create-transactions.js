'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      txn_id: {
        type: Sequelize.STRING
      },
      txn_date: {
        type: Sequelize.STRING
      },
      txn_time: {
        type: Sequelize.STRING
      },
      txn_amount:{
        type: Sequelize.STRING
      },
      message_type:{
        type: Sequelize.STRING,
      },
      gateway_name:{
        allowNull: true,
        type: Sequelize.STRING
      },
      local_txn_id:{
        allowNull: true,
        type: Sequelize.STRING
      },
      added_type:{
        comment:'1 => withdrawal , 2 => add money, 3 => Ticket Purchase, 4 => winner Amount',
        type: Sequelize.STRING
      },
      status:{
        comment:'0=>pending,1=>success,2=>cancel',
        type: Sequelize.STRING
      },
      payout_status:{
        defaultValue:false,
        comment:'0=>processing,1=>success,2=>cancel',
        type: Sequelize.STRING
      },
      payout_response:{
        allowNull: true,
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('transactions');
  }
};