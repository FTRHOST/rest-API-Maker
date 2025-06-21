const { Route, Controller, DatabaseConnection } = require('../models');
const { getConnectionPool } = require('./connectionManager');
const logger = require('../utils/logger');

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

// Ini adalah middleware Master Router kita
async function dynamicRouteHandler(req, res, next) {
  try {
    // Cari route yang cocok di database berdasarkan path dan method
    const route = await Route.findOne({
      where: {
        path: req.path,
        http_method: req.method.toUpperCase(),
      },
      include: [{
        model: Controller,
        as: 'controller',
        include: [{
          model: DatabaseConnection,
          as: 'databaseConnection',
        }]
      }]
    });

    // Jika tidak ada route yang cocok, lanjutkan ke handler berikutnya (404)
    if (!route || !route.controller || !route.controller.databaseConnection) {
      return next();
    }

    // Jika route ditemukan, jalankan logikanya (kode ini sama seperti sebelumnya)
    const controllerConfig = route.controller;
    const logPrefix = `[Dynamic Route: ${req.method} ${req.path}]`;

    logger.info(`${logPrefix} Route matched. Executing controller: ${controllerConfig.function_name}`);
    
    const dbPool = getConnectionPool(controllerConfig.databaseConnection);
    const executeQuery = (query, params) => dbPool.execute(query, params);
    
    const sandboxedFunction = new AsyncFunction('req', 'res', 'executeQuery', 'logger', controllerConfig.code_body);
    
    await sandboxedFunction(req, res, executeQuery, logger);

  } catch (error) {
    logger.error(`Error in dynamicRouteHandler for ${req.method} ${req.path}:`, error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
}

// Ekspor middleware-nya
module.exports = { dynamicRouteHandler };