const { Route, Controller, DatabaseConnection } = require('../models');
const { getConnectionPool } = require('./connectionManager');
const logger = require('../utils/logger');

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

async function initializeDynamicRoutes(app) {
  try {
    logger.info('Initializing dynamic routes from database...');
    
    const routes = await Route.findAll({
      include: [{
        model: Controller,
        as: 'controller',
        required: false, // UBAH MENJADI LEFT JOIN
        include: [{
          model: DatabaseConnection,
          as: 'databaseConnection',
          required: false, // UBAH MENJADI LEFT JOIN
        }]
      }]
    });

    if (routes.length === 0) {
      logger.warn("No routes found in the database to initialize.");
    }

    for (const route of routes) {
      // Pemeriksaan keamanan yang lebih baik
      if (!route.controller || !route.controller.databaseConnection || !route.controller.code_body) {
        logger.warn(`Skipping route ID ${route.id} (${route.http_method} ${route.path}) due to incomplete configuration. Controller or DB Connection might be missing.`);
        continue;
      }

      const method = route.http_method.toLowerCase();
      const path = route.path;
      const controllerConfig = route.controller;
      
      const logPrefix = `[Dynamic Route: ${method.toUpperCase()} ${path}]`;

      app[method](path, async (req, res) => {
        logger.info(`${logPrefix} Request received.`);
        try {
          const dbPool = getConnectionPool(controllerConfig.databaseConnection);
          const executeQuery = async (query, params) => {
            try {
              logger.info(`${logPrefix} Executing query: ${query}`, { params });
              const [results] = await dbPool.execute(query, params);
              logger.info(`${logPrefix} Query executed successfully, returned ${results.length} rows.`);
              return [results];
            } catch (queryError) {
              logger.error(`${logPrefix} Error during query execution:`, queryError);
              throw queryError;
            }
          };

          const sandboxedFunction = new AsyncFunction('req', 'res', 'executeQuery', 'logger', controllerConfig.code_body);
          
          logger.info(`${logPrefix} Executing user-defined controller code...`);
          await sandboxedFunction(req, res, executeQuery, logger);
          logger.info(`${logPrefix} User-defined controller code finished.`);

        } catch (error) {
          logger.error(`${logPrefix} An error occurred in the handler:`, error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'An internal server error occurred while executing the route logic.' });
          }
        }
      });
      
      logger.info(`Successfully registered route: ${method.toUpperCase()} ${path}`);
    }

    // Pindahkan log ini ke bawah agar lebih akurat
    logger.info(`Initialization complete. Total routes found: ${routes.length}.`);

  } catch (error) {
    logger.error('Failed to initialize dynamic routes:', error);
  }
}

module.exports = { initializeDynamicRoutes };
