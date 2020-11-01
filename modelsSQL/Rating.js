const {Sequelize, Model, DataTypes, Deferrable } = require("sequelize");

const sequelize = require('../config/mysqldb');
class Rating extends Model { }

Rating.init({
    // Model attributes are defined here
    averageRating: {
        type: DataTypes.FLOAT,
        min: 1,
        max: 10
    },
    rating: {
        type: DataTypes.INTEGER
    }

}, {
    // Other model options go here
    freezeTableName: true,
    sequelize, // We need to pass the connection instance
    modelName: 'Rating' // We need to choose the model name
});
module.exports = Rating;