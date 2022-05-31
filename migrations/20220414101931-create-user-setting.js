'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      color: {
        type: Sequelize.STRING,
        allowNull:true,
        
      },
      gameboardsound: {
        type: Sequelize.BOOLEAN,
        allowNull:true,
      },
      overallgamesound: {
        type: Sequelize.BOOLEAN,
        allowNull:true,
      },
      language: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('user_settings');
  }
};