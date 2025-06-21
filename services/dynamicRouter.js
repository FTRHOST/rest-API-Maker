const { getRouteFromCache } = require('./routeCache'); // Impor dari cache
const { getConnectionPool } = require('./connectionManager');
const logger = require('../utils/logger');

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

async function dynamicRouteHandler(req, res, next) {
  // Ambil route dari cache, bukan dari DB
  const route = getRouteFromCache(req.method, req.path);

  // Jika tidak ada di cache, lanjutkan
  if (!route) {
    return next();
  }

  // Jika ditemukan, eksekusi (logika ini sama seperti sebelumnya)
  try {
    const controllerConfig = route.controller;
    const logPrefix = `[Dynamic Route: ${req.method} ${req.path}]`;
    logger.info(`${logPrefix} Route matched from cache. Executing controller: ${controllerConfig.function_name}`);
    
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

module.exports = { dynamicRouteHandler };