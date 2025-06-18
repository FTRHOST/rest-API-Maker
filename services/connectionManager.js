const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Cache untuk menyimpan pool koneksi yang sudah dibuat
const connectionPools = new Map();

/**
 * Mendapatkan atau membuat pool koneksi database berdasarkan konfigurasinya.
 * @param {object} dbConfig - Objek konfigurasi dari model DatabaseConnection.
 * @returns {object} - Pool koneksi yang siap digunakan.
 */
function getConnectionPool(dbConfig) {
  const cacheKey = dbConfig.id;

  // Jika pool untuk ID ini sudah ada di cache, langsung kembalikan
  if (connectionPools.has(cacheKey)) {
    return connectionPools.get(cacheKey);
  }

  logger.info(`Creating new connection pool for: ${dbConfig.connection_name}`);

  let pool;
  // Saat ini kita hanya mendukung mysql, tapi bisa diperluas di sini
  if (dbConfig.db_type === 'mysql') {
    pool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database_name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } else {
    // Lemparkan error jika tipe DB tidak didukung
    throw new Error(`Database type '${dbConfig.db_type}' is not supported yet.`);
  }

  // Simpan pool yang baru dibuat ke cache
  connectionPools.set(cacheKey, pool);
  return pool;
}

module.exports = { getConnectionPool };