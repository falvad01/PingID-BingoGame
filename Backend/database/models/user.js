const { DataTypes } = require("sequelize");
const sequelize = require("../DBConnection"); // assuming your database connection is in database.js

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name_surname: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    administrator: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    createdAt: true,
    createdAt: "created_at",
    updatedAt: false
  }
);

module.exports = User;
