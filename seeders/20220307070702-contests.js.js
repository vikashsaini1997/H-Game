'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('contests',[
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:"100",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:"99",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:"98",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:"97",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:"96",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:"95",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:"94",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:"93",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:"92",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:"91",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:"100",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:"99",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:"98",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:"97",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:"96",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:"95",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:"94",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:"93",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:"92",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:"91",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },

      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:"100",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:"99",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:"98",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:"97",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:"96",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:"95",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:"94",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:"93",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:"92",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:"91",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },

      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:"100",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:"99",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:"98",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:"97",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:"96",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:"95",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:"94",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:"93",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:"92",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:"91",status:"1",createdAt:new Date(),updatedAt:new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('contests',{},null);
  }
};
