'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('categories',[
      {
        random_id:uuidv4(),category_name:"Any Line",title_name:"Quick Win!",categroy_image:'https://housie-images.s3.amazonaws.com/anyline-cat.svg',createdAt:new Date(),updatedAt:new Date()
      },
      {
        random_id:uuidv4(),category_name:"Full Ticket",title_name:"Take Your Time!",categroy_image:'https://housie-images.s3.amazonaws.com/full-ticket-cat.svg',createdAt:new Date(),updatedAt:new Date()
      },
      {
        random_id:uuidv4(),category_name:"Early 13",title_name:"No More Unlucky!",categroy_image:'https://housie-images.s3.amazonaws.com/early13-cat.svg',createdAt:new Date(),updatedAt:new Date()
      },
      {
        random_id:uuidv4(),category_name:"6 Corners",title_name:"Hits Like Cricket!",categroy_image:'https://housie-images.s3.amazonaws.com/six-corners-cat.svg',createdAt:new Date(),updatedAt:new Date()
      },
   ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('categories',{},null);
  }
};
