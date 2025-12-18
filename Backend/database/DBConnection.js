const { Sequelize } = require("sequelize");
require("dotenv").config();

// Configurar la conexión a la base de datos
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASS,
  {
    host: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT,
    dialect: "mysql",
    logging: false, // Disable SQL query logging
  }
);

module.exports = sequelize;
