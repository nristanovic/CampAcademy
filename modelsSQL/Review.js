const {Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = require('../config/mysqldb');

const User = require('../modelsSQL/User');
const Address = require('../modelsSQL/Address');
const Career = require('../modelsSQL/Career');
const Role = require('../modelsSQL/Role');
const Cost = require('../modelsSQL/Cost');
const Rating = require('../modelsSQL/Rating');
const Course = require('../modelsSQL/Course');
const Skill = require('../modelsSQL/Skill');
const Bootcamp = require('./BootcampSQL');


class Review extends Model {}

Review.init({
  // Model attributes are defined here
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
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
    bootcamp_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: Bootcamp,

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
  modelName: 'Review' // We need to choose the model name
});

module.exports = Review;