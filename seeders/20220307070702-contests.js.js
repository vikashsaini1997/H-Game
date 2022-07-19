'use strict';
const { v4: uuidv4 } = require('uuid');
//15:43:34.367
//15:45:53.757 

//1655892910000

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('contests',[
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+100 ,end_time:(Math.floor(new Date().getTime() / 1000)+100),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+99,end_time:(Math.floor(new Date().getTime() / 1000)+99),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+98,end_time:(Math.floor(new Date().getTime() / 1000)+98),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+97,end_time:(Math.floor(new Date().getTime() / 1000)+97),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+96,end_time:(Math.floor(new Date().getTime() / 1000)+96),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+95,end_time:(Math.floor(new Date().getTime() / 1000)+95),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+94,end_time:(Math.floor(new Date().getTime() / 1000)+94),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+93,end_time:(Math.floor(new Date().getTime() / 1000)+93),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+92,end_time:(Math.floor(new Date().getTime() / 1000)+92),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"1",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+91,end_time:(Math.floor(new Date().getTime() / 1000)+91),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+100,end_time:(Math.floor(new Date().getTime() / 1000)+100),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+99,end_time:(Math.floor(new Date().getTime() / 1000)+99),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+98,end_time:(Math.floor(new Date().getTime() / 1000)+98),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+97,end_time:(Math.floor(new Date().getTime() / 1000)+97),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+96,end_time:(Math.floor(new Date().getTime() / 1000)+96),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+95,end_time:(Math.floor(new Date().getTime() / 1000)+95),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+94,end_time:(Math.floor(new Date().getTime() / 1000)+94),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+93,end_time:(Math.floor(new Date().getTime() / 1000)+93),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+92,end_time:(Math.floor(new Date().getTime() / 1000)+92),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"2",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+91,end_time:(Math.floor(new Date().getTime() / 1000)+91),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },

      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+100,end_time:(Math.floor(new Date().getTime() / 1000)+100),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+99,end_time:(Math.floor(new Date().getTime() / 1000)+99),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+98,end_time:(Math.floor(new Date().getTime() / 1000)+98),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+97,end_time:(Math.floor(new Date().getTime() / 1000)+97),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+96,end_time:(Math.floor(new Date().getTime() / 1000)+96),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+95,end_time:(Math.floor(new Date().getTime() / 1000)+95),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+94,end_time:(Math.floor(new Date().getTime() / 1000)+94),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+93,end_time:(Math.floor(new Date().getTime() / 1000)+93),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+92,end_time:(Math.floor(new Date().getTime() / 1000)+92),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"3",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+91,end_time:(Math.floor(new Date().getTime() / 1000)+91),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },

      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"10",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+100,end_time:(Math.floor(new Date().getTime() / 1000)+100),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"25",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+99,end_time:(Math.floor(new Date().getTime() / 1000)+99),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"50",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+98,end_time:(Math.floor(new Date().getTime() / 1000)+98),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"75",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+97,end_time:(Math.floor(new Date().getTime() / 1000)+97),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"100",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+96,end_time:(Math.floor(new Date().getTime() / 1000)+96),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"150",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+95,end_time:(Math.floor(new Date().getTime() / 1000)+95),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"200",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+94,end_time:(Math.floor(new Date().getTime() / 1000)+94),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"400",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+93,end_time:(Math.floor(new Date().getTime() / 1000)+93),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"500",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+92,end_time:(Math.floor(new Date().getTime() / 1000)+92),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
      {
        category_id:"4",random_id:uuidv4(),contest_type:0,admin_comission:"0",winning_amount:'0',contest_size:'0',entry_fee:"1000",waiting_time:Math.floor(new Date().getTime() / 1000) - Math.floor(new Date().getTime() / 1000)+91,end_time:(Math.floor(new Date().getTime() / 1000)+91),status:"1",game_rule_number:"",createdAt:new Date(),updatedAt:new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('contests',{},null);
  }
};
