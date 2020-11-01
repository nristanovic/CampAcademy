const {Sequelize, Model, DataTypes, Deferrable } = require("sequelize");
const sequelize = require('../config/mysqldb');

class Skill extends Model { }

Skill.init({
    // Model attributes are defined here
    minimumSkill: {
        type: DataTypes.ENUM(
            'beginner', 'intermediate', 'advanced'), 
        allowNull: false
        }

}, {
    // Other model options go here
    freezeTableName: true,
    sequelize, // We need to pass the connection instance
    modelName: 'Skill' // We need to choose the model name
});

module.exports = Skill;
