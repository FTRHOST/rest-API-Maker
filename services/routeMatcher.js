const { pathToRegexp } = require('path-to-regexp');
const db = require('../models'); // Impor seluruh objek db

let compiledRoutes = [];

async function refreshRoutesCache() {
  try {
    const routesFromDb = await db.Route.findAll({
      include: [
        {
          model: db.Controller, // Gunakan db.Controller
          as: 'controller',
          include: [
            {
              model: db.DatabaseConnection, // Gunakan db.DatabaseConnection
              as: 'databaseConnection',
            },
          ],
        },
      ],
    });

    compiledRoutes = routesFromDb.map(route => {
      const keys = [];
      const regexp = pathToRegexp(route.path, keys);
      
      return {
        id: route.id,
        http_method: route.http_method,
        path: route.path,
        controller: route.controller,
        regexp: regexp,
        keys: keys,
      };
    });
    console.log(`[Route Matcher] Cache refreshed with ${compiledRoutes.length} routes.`);
  } catch (error) {
    console.error('[Route Matcher] Failed to refresh routes cache:', error);
  }
}

function findMatchingRoute(reqMethod, reqPath) {
  for (const route of compiledRoutes) {
    if (route.http_method !== reqMethod) {
      continue;
    }

    if (!(route.regexp instanceof RegExp)) {
      continue;
    }

    const match = route.regexp.exec(reqPath);
    if (match) {
      const params = {};
      route.keys.forEach((key, index) => {
        params[key.name] = match[index + 1];
      });
      return { route, params };
    }
  }
  return null;
}

module.exports = {
  refreshRoutesCache,
  findMatchingRoute,
};