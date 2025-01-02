const { DataTypes } = require("sequelize");
const sequelize = require("../DBConnection"); // assuming your database connection is in database.js
const User = require("./user");
const Season = require("./season")

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
    season_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Season,
        key: "id",
      },
    },

  },
  {
    tableName: "number",
    createdAt: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Define the association
User.hasMany(Number, { foreignKey: "user_id" });
Number.belongsTo(User, { foreignKey: "user_id" });
Number.belongsTo(Season, { foreignKey: "season_id" });

module.exports = Number;
