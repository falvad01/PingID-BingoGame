const { Sequelize } = require('sequelize');

// Configurar la conexión a la base de datos
const sequelize = new Sequelize('db', 'user', 'password', {
  host: '127.0.0.1',
  dialect: 'mysql'
});

module.exports = sequelize;
