const {Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = require('../config/mysqldb');

class Address extends Model { }


Address.init({
    // Model attributes are defined here
    formattedAddress: {
        type: DataTypes.STRING,
    },
    street: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    zipcode: {
        type: DataTypes.STRING,
    },
    country: {
        type: DataTypes.STRING,
    }


}, {
    // Other model options go here
    freezeTableName: true,
    sequelize, // We need to pass the connection instance
    modelName: 'Address' // We need to choose the model name
});

module.exports = Address;