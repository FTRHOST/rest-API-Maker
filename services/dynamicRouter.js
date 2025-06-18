const { Route, Controller, DatabaseConnection } = require('../models');
const { getConnectionPool } = require('./connectionManager');
const logger = require('../utils/logger');

// Dapatkan constructor untuk AsyncFunction. Ini lebih aman dari eval().
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

/**
 * Menginisialisasi semua route dinamis dari database dan meregistrasikannya ke aplikasi Express.
 * @param {object} app - Instance aplikasi Express.
 */
async function initializeDynamicRoutes(app) {
  try {
    logger.info('Initializing dynamic routes from database...');
    
    const routes = await Route.findAll({
      include: {
        model: Controller,
        as: 'controller',
        include: {
          model: DatabaseConnection,
          as: 'databaseConnection'
        }
      }
    });

    for (const route of routes) {
      if (!route.controller || !route.controller.databaseConnection || !route.controller.code_body) {
        logger.warn(`Skipping route ID ${route.id} (${route.http_method} ${route.path}) due to incomplete configuration.`);
        continue;
      }

      const method = route.http_method.toLowerCase();
      const path = route.path;
      const controllerConfig = route.controller;
      
// Registrasikan route ke Express
app[method](path, async (req, res) => {
  const logPrefix = `[Dynamic Route: ${method.toUpperCase()} ${path}]`;
  logger.info(`${logPrefix} Request received.`);
  
  try {
    // 1. Dapatkan pool koneksi dinamis
    logger.info(`${logPrefix} Getting connection pool for DB: '${controllerConfig.databaseConnection.connection_name}' (ID: ${controllerConfig.databaseConnection.id})`);
    const dbPool = getConnectionPool(controllerConfig.databaseConnection);
    
    // 2. Buat helper executeQuery untuk controller ini
    const executeQuery = async (query, params) => {
      try {
        logger.info(`${logPrefix} Executing query: ${query}`, { params });
        const [results] = await dbPool.execute(query, params);
        logger.info(`${logPrefix} Query executed successfully, returned ${results.length} rows.`);
        return [results]; // Kembalikan dalam format yang sama seperti sebelumnya
      } catch (queryError) {
        logger.error(`${logPrefix} Error during query execution:`, queryError);
        // Lemparkan kembali error agar bisa ditangkap oleh blok catch utama
        throw queryError;
      }
    };

    // 3. Buat fungsi yang bisa dieksekusi dari code_body
    const sandboxedFunction = new AsyncFunction('req', 'res', 'executeQuery', 'logger', controllerConfig.code_body);

    // 4. Eksekusi kode pengguna di dalam "sandbox"
    logger.info(`${logPrefix} Executing user-defined controller code...`);
    await sandboxedFunction(req, res, executeQuery, logger);
    logger.info(`${logPrefix} User-defined controller code finished.`);

  } catch (error) {
    // 'error' di sini bisa dari `getConnectionPool` atau dari `sandboxedFunction`
    logger.error(`${logPrefix} An error occurred in the handler:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal server error occurred while executing the route logic.' });
    }
  }
});
    }

    logger.info(`Successfully initialized ${routes.length} dynamic routes.`);

  } catch (error) {
    logger.error('Failed to initialize dynamic routes:', error);
  }
}

module.exports = { initializeDynamicRoutes };