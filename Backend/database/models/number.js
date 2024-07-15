const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // assuming your database connection is in database.js
const User = require("./user");

const Number = sequelize.define(
  "Number",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "number",
    timestamps: false,
  }
);

// Define the association
User.hasMany(Number, { foreignKey: "user_id" });
Number.belongsTo(User, { foreignKey: "user_id" });

module.exports = Number;
