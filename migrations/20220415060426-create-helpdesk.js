'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('helpdesks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.TEXT
      },
      status: {
        allowNull: false,
        comment:'0 = pending, 1 = replied',
        defaultValue:"0",
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('helpdesks');
  }
};