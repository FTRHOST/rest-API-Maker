const { DatabaseConnection, Controller, Route, sequelize } = require('../models');
const logger = require('../utils/logger');
const { reloadRoutesCache } = require('../services/routeCache'); // Impor fungsi reload

// === Database Connection Management ===
exports.createDbConnection = async (req, res) => { /* ... (logika di sini) */ };
exports.getAllDbConnections = async (req, res) => { /* ... (logika di sini) */ };
exports.getDbConnectionById = async (req, res) => { /* ... (logika di sini) */ };
exports.updateDbConnection = async (req, res) => { /* ... (logika di sini) */ };
exports.deleteDbConnection = async (req, res) => { /* ... (logika di sini) */ };

// New function to test DB connection
exports.testDbConnection = async (req, res) => {
  try {
    // sequelize.authenticate() akan melempar error jika koneksi gagal.
    await sequelize.authenticate();
    
    logger.info('[DB Test] Main application database connection successful.');
    res.status(200).json({ 
      status: 'success', 
      message: 'Connection to the main application database has been established successfully.' 
    });
  } catch (error) {
    logger.error('[DB Test] Main application database connection failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to the main application database.',
      // Sertakan pesan error untuk debugging
      error_details: error.message, 
      error_name: error.name
    });
  }
};

// === Controller Management ===
exports.createController = async (req, res) => { /* ... (logika di sini) */ };
exports.getAllControllers = async (req, res) => { /* ... (logika di sini) */ };
exports.getControllerById = async (req, res) => { /* ... (logika di sini) */ };
exports.updateController = async (req, res) => { /* ... (logika di sini) */ };
exports.deleteController = async (req, res) => { /* ... (logika di sini) */ };

// === Route Management ===
exports.createRoute = async (req, res) => { /* ... (logika di sini) */ };
exports.getAllRoutes = async (req, res) => { /* ... (logika di sini) */ };
exports.getRouteById = async (req, res) => { /* ... (logika di sini) */ };
exports.updateRoute = async (req, res) => { /* ... (logika di sini) */ };
exports.deleteRoute = async (req, res) => { /* ... (logika di sini) */ };

// --- IMPLEMENTASI LENGKAPNYA ---

// DB Connections
exports.createDbConnection = async (req, res) => {
  const t = await sequelize.transaction(); // Mulai transaksi secara manual
  logger.info('[Management] Attempting to create DB connection with data:', req.body);
  try {
    const dbConnection = await DatabaseConnection.create(req.body, { transaction: t });
    logger.info('[Management] Sequelize CREATE successful within transaction. Resulting object:', dbConnection.toJSON());
    
    await t.commit(); // Commit transaksi secara eksplisit
    logger.info('[Management] Transaction committed.');

    // VERIFIKASI SETELAH COMMIT
    const verification = await DatabaseConnection.findByPk(dbConnection.id);
    logger.info('[Management] Verification check post-commit. Found data:', verification ? verification.toJSON() : 'NULL (NOT FOUND!)');

    res.status(201).json({
      message: "Database connection created successfully.",
      data: dbConnection
    });
  } catch (error) {
    await t.rollback(); // Rollback jika ada error
    logger.error('[Management] Error creating DB connection, transaction rolled back:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDbConnections = async (req, res) => {
  try {
    const dbConnections = await DatabaseConnection.findAll();
    res.status(200).json({ data: dbConnections });
  } catch (error) {
    logger.error('Error fetching DB connections:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getDbConnectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const dbConnection = await DatabaseConnection.findByPk(id);
    if (!dbConnection) return res.status(404).json({ message: "Database connection not found." });
    res.status(200).json({ data: dbConnection });
  } catch (error) {
    logger.error(`Error fetching DB connection ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateDbConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await DatabaseConnection.update(req.body, { where: { id: id } });
    if (updated) {
      const updatedDbConnection = await DatabaseConnection.findByPk(id);
      res.status(200).json({ message: "Database connection updated successfully.", data: updatedDbConnection });
    } else {
      res.status(404).json({ message: "Database connection not found." });
    }
  } catch (error) {
    logger.error(`Error updating DB connection ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
exports.deleteDbConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DatabaseConnection.destroy({ where: { id: id } });
    if (deleted) res.status(200).json({ message: "Database connection deleted successfully." });
    else res.status(404).json({ message: "Database connection not found." });
  } catch (error) {
    logger.error(`Error deleting DB connection ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Controllers
exports.createController = async (req, res) => {
  try {
    const controller = await Controller.create(req.body);
    res.status(201).json({ message: "Controller created successfully.", data: controller });
  } catch (error) {
    logger.error('Error creating controller:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getAllControllers = async (req, res) => {
  try {
    const controllers = await Controller.findAll({ include: [{ model: DatabaseConnection, as: 'databaseConnection', attributes: ['id', 'connection_name'] }] });
    res.status(200).json({ data: controllers });
  } catch (error) {
    logger.error('Error fetching controllers:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getControllerById = async (req, res) => {
  try {
    const { id } = req.params;
    const controller = await Controller.findByPk(id, { include: [{ model: DatabaseConnection, as: 'databaseConnection' }] });
    if (!controller) return res.status(404).json({ message: "Controller not found." });
    res.status(200).json({ data: controller });
  } catch (error) {
    logger.error(`Error fetching controller ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Controller.update(req.body, { where: { id: id } });
    if (updated) {
      const updatedController = await Controller.findByPk(id);
      res.status(200).json({ message: "Controller updated successfully.", data: updatedController });
    } else {
      res.status(404).json({ message: "Controller not found." });
    }
  } catch (error) {
    logger.error(`Error updating controller ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
exports.deleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const existingRoutes = await Route.count({ where: { controllerId: id } });
    if (existingRoutes > 0) return res.status(400).json({ message: `Cannot delete controller. It is currently used by ${existingRoutes} route(s).` });
    const deleted = await Controller.destroy({ where: { id: id } });
    if (deleted) res.status(200).json({ message: "Controller deleted successfully." });
    else res.status(404).json({ message: "Controller not found." });
  } catch (error) {
    logger.error(`Error deleting controller ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

// Routes
exports.createRoute = async (req, res) => {
  try {
    const { http_method, path, controllerId } = req.body;

    // Validasi untuk memastikan controllerId ada dan valid
    if (!controllerId) {
        return res.status(400).json({ message: "Field 'controllerId' is required." });
    }
    const controllerExists = await Controller.findByPk(controllerId);
    if (!controllerExists) {
      return res.status(404).json({ message: `Controller with ID ${controllerId} not found.` });
    }

    // Buat route baru. Secara eksplisit petakan properti ke kolom model.
    const route = await Route.create({
      http_method: http_method,
      path: path,
      controllerId: controllerId // Ini adalah pemetaan yang paling penting
    });

// TRIGGER PEMBARUAN CACHE!
await reloadRoutesCache(); 

res.status(201).json({
  message: "Route created successfully and cache reloaded.",
  data: route
});
} catch (error) {
    logger.error('Error creating route:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({ include: [{ model: Controller, as: 'controller', attributes: ['id', 'function_name'] }], order: [['path', 'ASC']] });
    res.status(200).json({ data: routes });
  } catch (error) {
    logger.error('Error fetching routes:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findByPk(id, { include: [{ model: Controller, as: 'controller', include: [{ model: DatabaseConnection, as: 'databaseConnection', attributes: ['id', 'connection_name'] }] }] });
    if (!route) return res.status(404).json({ message: "Route not found." });
    res.status(200).json({ data: route });
  } catch (error) {
    logger.error(`Error fetching route ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { controllerId } = req.body;
    if (controllerId) {
      const controllerExists = await Controller.findByPk(controllerId);
      if (!controllerExists) return res.status(404).json({ message: `Controller with ID ${controllerId} not found.` });
    }
    const [updated] = await Route.update(req.body, { where: { id: id } });
    if (updated) {
      const updatedRoute = await Route.findByPk(id);
      // TRIGGER PEMBARUAN CACHE!
    await reloadRoutesCache(); 

    res.status(200).json({
      message: "Route updated successfully and cache reloaded.",
      data: updatedRoute
    });
  } else {
      res.status(404).json({ message: "Route not found." });
    }
  } catch (error) {
    logger.error(`Error updating route ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Route.destroy({ where: { id: id } });
    // TRIGGER PEMBARUAN CACHE!
    await reloadRoutesCache(); 
    if (deleted) res.status(200).json({ message: "Route deleted successfully and cache reloaded." });
    else res.status(404).json({ message: "Route not found." });
  } catch (error) {
    logger.error(`Error deleting route ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};