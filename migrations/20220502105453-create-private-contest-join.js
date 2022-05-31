'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('private_contest_joins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contest_id: {
        type: Sequelize.STRING
      },
      user_contest_id: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.STRING
      },
      host: {
        type: Sequelize.BOOLEAN,
        comment:'true = host, false = not host',
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
    await queryInterface.dropTable('private_contest_joins');
  }
};