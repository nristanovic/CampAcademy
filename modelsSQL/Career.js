const {Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = require('../config/mysqldb');

class Career extends Model { }

Career.init({
    // Model attributes are defined here
    name: {
        type: DataTypes.ENUM(
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ),
        allowNull: false
        }

}, {
    // Other model options go here
    freezeTableName: true,
    sequelize, // We need to pass the connection instance
    modelName: 'Career' // We need to choose the model name
});

module.exports = Career;