'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('cms',[
      {
        name:"About us",text:"Test",createdAt:new Date(),updatedAt:new Date()
      },
      {
        name:"FAQ",text:"Test",createdAt:new Date(),updatedAt:new Date()
      },
      {
        name:"Privacy Policy",text:"Test",createdAt:new Date(),updatedAt:new Date()
      },
      {
        name:"How to Play",text:"Test",createdAt:new Date(),updatedAt:new Date()
      },
      {
        name:"Terms & Conditions",text:"Test",createdAt:new Date(),updatedAt:new Date()
      },
   ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('cms',{},null);
  }
};
