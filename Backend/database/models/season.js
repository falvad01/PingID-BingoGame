const { DataTypes } = require("sequelize");
const sequelize = require("../DBConnection"); // assuming your database connection is in database.js

const Season = sequelize.define(
  "Season",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },

  },
  {
    tableName: "season",
    createdAt: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);



module.exports = Season;
