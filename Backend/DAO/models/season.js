const { DataTypes } = require("sequelize");
const sequelize = require("../connection/DBConnection"); // assuming your database connection is in database.js

const Season = sequelize.define(
  "Season",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
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
