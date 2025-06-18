const { Sequelize } = require('sequelize');
const path = require('path');

// Konfigurasi koneksi Sequelize menggunakan SQLite
// Database akan disimpan dalam file 'db.sqlite' di root folder proyek.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'db.sqlite'),
  logging: false // Matikan logging query SQL di console
});

module.exports = sequelize;