'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announced_numbers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      contest_id: {
        type: Sequelize.STRING
      },
      announced_number: {
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
    await queryInterface.dropTable('announced_numbers');
  }
};