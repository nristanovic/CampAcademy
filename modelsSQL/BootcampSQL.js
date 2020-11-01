const { Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = require('../config/mysqldb');

const User = require('./User');
const Address = require('./Address');
const Career = require('./Career');
const Role = require('./Role');
const Cost = require('./Cost');
const Rating = require('./Rating');




class BootcampSQL extends Model {}

BootcampSQL.init({
  // Model attributes are defined here
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  slug: DataTypes.STRING,
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  website: {
    type: DataTypes.STRING,
    isUrl: true    
  },
  phone: DataTypes.STRING(20),
  email: {
      type: DataTypes.STRING,
      isEmail: true,
  },
  address: DataTypes.STRING,
  photo: {
      type: DataTypes.STRING,
      defaultValue: 'no-photo.jpg'
  },
  createdAt: {
    type: DataTypes.DATETIME,
    defaultValue: Sequelize.NOW
    // This way, the current date/time will be used to populate this column (at the moment of insertion)
  },
  user_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: User,

      // This is the column name of the referenced model
      key: 'id',

      
      // Options:
      // - `Deferrable.INITIALLY_IMMEDIATE` - Immediately check the foreign key constraints
      // - `Deferrable.INITIALLY_DEFERRED` - Defer all foreign key constraint check to the end of a transaction
      // - `Deferrable.NOT` - Don't defer the checks at all (default) - This won't allow you to dynamically change the rule in a transaction
    }
    },
    address_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: Address,

      // This is the column name of the referenced model
      key: 'id',

    }

    },
    career_id: {
        type: DataTypes.INTEGER,
    
        references: {
          // This is a reference to another model
          model: Career,
    
          // This is the column name of the referenced model
          key: 'id',
    
        }
    
    },
    role_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: Role,

      // This is the column name of the referenced model
      key: 'id',

    }

  },
  cost_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: Cost,

      // This is the column name of the referenced model
      key: 'id',

    }

  },
  rating_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: Rating,

      // This is the column name of the referenced model
      key: 'id',

    }

  }
   
}, {
  // Other model options go here
  freezeTableName: true,
  sequelize, // We need to pass the connection instance
  modelName: 'BootcampSQL' // We need to choose the model name
});

module.exports = BootcampSQL;

