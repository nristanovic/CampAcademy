const {Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = require('../config/mysqldb');

class Cost extends Model { }

Cost.init({
    // Model attributes are defined here
    averageCost: {
        type: DataTypes.INTEGER
    },
    tuition: {
        type: DataTypes.INTEGER
    }

}, {
    // Other model options go here
    freezeTableName: true,
    sequelize, // We need to pass the connection instance
    modelName: 'Cost' // We need to choose the model name
});

module.exports = Cost;