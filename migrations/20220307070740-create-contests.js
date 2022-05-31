'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      random_id: {
        type: Sequelize.STRING
      },
      contest_type: {
        type: Sequelize.INTEGER,
        comment:"public =>0, private =>1", 
      },
      admin_comission: {
        allowNull: false,
        type: Sequelize.STRING
      },
      winning_amount: {
        allowNull: false,
        type: Sequelize.STRING
      },
      contest_size: {
        allowNull: false,
        type: Sequelize.STRING
      },
      entry_fee: {
        allowNull: false,
        type: Sequelize.STRING
      },
      waiting_time: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status:{
        allowNull: false,
        comment:"Waiting =>0, Starting =>1, Started => 2 ,Completed=>3",
        type: Sequelize.STRING
      },
      is_processing:{
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      announced_numbers:{
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
    await queryInterface.dropTable('contests');
  }
};