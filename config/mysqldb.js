const { Sequelize } = require('sequelize');


module.exports  = new Sequelize( 'nosql', 'root', 'dell123', {
        host: '127.0.0.1',
        dialect: "mysql"
      
    });

    

