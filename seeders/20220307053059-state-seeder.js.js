'use strict';
    const { Country, CountryLite } = require('country-state-city-js');
    var india = Country('IN')
    var state = Country('IN', { states:true })
    var data = state.states

    var india =[]
    data.map((item)=>{
      india.push(item.name)
    })
    
    module.exports = {
      up: (queryInterface, Sequelize) => {
        
          var newData = [];
          data.map((item)=>{
              const seedData = {
                state_name :item.name,
                  createdAt: new Date(),
                  updatedAt: new Date()
              };
              newData.push(seedData);
        })
          return queryInterface.bulkInsert('states', newData);
      },
  

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('states',{},null);
  }
};
