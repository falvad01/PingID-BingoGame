const sequelize = require("./DBConnection");
const User = require("../models/user");
const Season = require("../models/season");
const Number = require("../models/number");
const ExtensionVersion = require("../models/extension_version");

async function createDB() {
  try {
    // Sync all models (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.info("Tables created or updated if changes exist");
  } catch (error) {
    console.error("Error creating database tables:", error);
    throw error;
  }
}

module.exports = { createDB };
