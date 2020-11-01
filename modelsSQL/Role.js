const { Sequelize,Model, DataTypes, Deferrable } = require("sequelize");
const sequelize = require('../config/mysqldb');

class Role extends Model { }

Role.init({
    // Model attributes are defined here
    name: {
        type: DataTypes.ENUM(
            'user', 'publisher'),
        
        defaultValue: 'user',    
        allowNull: false
        }

}, {
    // Other model options go here
    freezeTableName: true,
    sequelize, // We need to pass the connection instance
    modelName: 'Role' // We need to choose the model name
});

module.exports = Role;