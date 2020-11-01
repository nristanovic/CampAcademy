const { Sequelize, Model, DataTypes, Deferrable } = require("sequelize");
const sequelize = require('../config/mysqldb');



const Role = require('../modelsSQL/Role');


class User extends Model {}

User.init({
  // Model attributes are defined here
    name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
    },
    email: {
    type: DataTypes.STRING,
    isEmail: true,
    allowNull: false,
    unique: true
    },
    password: {
    type: DataTypes.STRING,
    allowNull: false,
    min: 6
    },
    createdAt: {
        type: DataTypes.DATETIME,
        defaultValue: Sequelize.NOW
        // This way, the current date/time will be used to populate this column (at the moment of insertion)
    },
    role_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: Role,

      // This is the column name of the referenced model
      key: 'id',

    }

    }
   
}, {
  // Other model options go here
  freezeTableName: true,
  sequelize, // We need to pass the connection instance
  modelName: 'User' // We need to choose the model name
});
module.exports = User;
