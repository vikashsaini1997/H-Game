'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('join_contest_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      contest_id: {
        type: Sequelize.INTEGER
      },
      total_amount: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      win_status: {
        allowNull: true,
        type: Sequelize.INTEGER,
        comment:'lose => 0, win=>1'
      },
      bonus_amount: {
        allowNull: true,
        type: Sequelize.STRING
      },
      cash_balance: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      winning_balance: {
        allowNull: true,
        type: Sequelize.STRING
      },
      time: {
        allowNull: true,
        type: Sequelize.TEXT('long')
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
    await queryInterface.dropTable('join_contest_details');
  }
};