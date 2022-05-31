'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('states',[
      {
        state_name:"Gujrat",createdAt:new Date(),updatedAt:new Date()
      },
      {
        state_name:"Rajasthan",createdAt:new Date(),updatedAt:new Date()
      },
      {
        state_name:"Delhi",createdAt:new Date(),updatedAt:new Date()
      },
   ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('states',{},null);
  }
};
