const { Sequelize } = require('sequelize');

// Konfigurasi ini harus cocok dengan yang ada di docker-compose.yml
const DATABASE_NAME = 'apidashboard';
const USERNAME = 'admin';
const PASSWORD = 'admin';
const HOST = 'localhost'; // Karena kita memetakan port, kita bisa pakai localhost
const DIALECT = 'postgres';

const sequelize = new Sequelize(DATABASE_NAME, USERNAME, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  logging: false,
});

module.exports = sequelize;