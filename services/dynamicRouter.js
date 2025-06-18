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
        try {
          // 1. Dapatkan pool koneksi dinamis
          const dbPool = getConnectionPool(controllerConfig.databaseConnection);
          
          // 2. Buat helper executeQuery untuk controller ini
          const executeQuery = (query, params) => {
            // Untuk mysql, kita pakai pool.execute
            return dbPool.execute(query, params);
          };

          // 3. Buat fungsi yang bisa dieksekusi dari code_body
          const sandboxedFunction = new AsyncFunction('req', 'res', 'executeQuery', 'logger', controllerConfig.code_body);

          // 4. Eksekusi kode pengguna di dalam "sandbox"
          await sandboxedFunction(req, res, executeQuery, logger);

        } catch (error) {
          logger.error(`Error executing dynamic controller for ${method.toUpperCase()} ${path}:`, error);
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