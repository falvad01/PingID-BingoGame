const { Sequelize } = require('sequelize');
require('dotenv').config()

// Configurar la conexión a la base de datos
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASS, {
  host: process.env.DATABASE_URL,
  dialect: 'mysql'
});

module.exports = sequelize;
