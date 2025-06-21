const { Sequelize } = require('sequelize');

// --- KONFIGURASI MYSQL ANDA DI SINI ---
const DATABASE_NAME = 'db_api_dashboard';       // Nama DB yang Anda buat di Langkah 2
const USERNAME = 'db_api_dashboard';                        // Username MySQL Anda (misalnya, 'root')
const PASSWORD = 'apimansaba';         // Password MySQL Anda
const HOST = '62.72.7.236';                       // atau IP address server MySQL Anda
const DIALECT = 'mysql';

// Pastikan Anda sudah menginstal driver mysql2: pnpm add mysql2

const sequelize = new Sequelize(DATABASE_NAME, USERNAME, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  logging: false, // Set ke `console.log` jika ingin melihat query SQL saat debugging
});

module.exports = sequelize;