'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_docs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      pan_card_no: {
        type: Sequelize.STRING
      },
      doc_image: {
        type: Sequelize.STRING
      },
      pan_card_name: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      aadhar_card_name: {
        type: Sequelize.STRING
      },
      aadhar_card_no: {
        type: Sequelize.STRING
      },
      is_verified: {
        type: Sequelize.INTEGER,
        default:0,
        COMMENT: '0=>No response,1=>under review, 2=>accepted, 3=>rejected'
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
    await queryInterface.dropTable('user_docs');
  }
};