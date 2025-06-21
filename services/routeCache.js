const { Route, Controller, DatabaseConnection } = require('../models');
const logger = require('../utils/logger');

// Cache kita adalah sebuah Map
const activeRoutesCache = new Map();

/**
 * Memuat ulang semua route dari database ke dalam cache di memori.
 * Fungsi ini akan dipanggil saat startup dan setiap kali ada perubahan.
 */
async function reloadRoutesCache() {
  logger.info('Reloading routes cache from database...');
  try {
    const routes = await Route.findAll({
      include: [{
        model: Controller,
        as: 'controller',
        required: true, // INNER JOIN untuk memastikan hanya route yang valid yang masuk cache
        include: [{
          model: DatabaseConnection,
          as: 'databaseConnection',
          required: true,
        }]
      }]
    });

    // Bersihkan cache lama
    activeRoutesCache.clear();

    // Isi cache dengan data baru
    for (const route of routes) {
      const cacheKey = `${route.http_method}:${route.path}`;
      activeRoutesCache.set(cacheKey, route);
    }
    logger.info(`Routes cache reloaded successfully. ${activeRoutesCache.size} active routes loaded.`);
  } catch (error) {
    logger.error('Failed to reload routes cache:', error);
  }
}

/**
 * Mendapatkan satu route dari cache.
 * @param {string} method - Metode HTTP (e.g., 'GET')
 * @param {string} path - Path URL (e.g., '/siswa')
 * @returns {object|undefined} - Konfigurasi route jika ditemukan.
 */
function getRouteFromCache(method, path) {
  const cacheKey = `${method.toUpperCase()}:${path}`;
  return activeRoutesCache.get(cacheKey);
}

module.exports = {
  reloadRoutesCache,
  getRouteFromCache,
};