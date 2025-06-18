const { DatabaseConnection, Controller, Route } = require('../models');
const logger = require('../utils/logger');

// === Database Connection Management ===
// ... (kode dari langkah sebelumnya) ...

// === Controller Management ===
// ... (kode dari langkah sebelumnya) ...

// === Route Management ===

/**
 * Membuat route baru.
 */
exports.createRoute = async (req, res) => {
  try {
    const { http_method, path, controllerId } = req.body;

    // Validasi untuk memastikan controllerId ada sebelum membuat route
    if (controllerId) {
      const controllerExists = await Controller.findByPk(controllerId);
      if (!controllerExists) {
        return res.status(404).json({ message: `Controller with ID ${controllerId} not found. Please create the controller first.` });
      }
    }

    const route = await Route.create({ http_method, path, controllerId });
    res.status(201).json({
      message: "Route created successfully.",
      data: route
    });
  } catch (error) {
    logger.error('Error creating route:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mendapatkan semua route, termasuk detail controller-nya.
 */
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      include: [{
        model: Controller,
        as: 'controller', // 'as' harus cocok dengan yang di models/index.js
        attributes: ['id', 'function_name'] // Hanya ambil field yang relevan dari controller
      }],
      order: [
        ['path', 'ASC'] // Urutkan berdasarkan path alphabetis
      ]
    });
    res.status(200).json({ data: routes });
  } catch (error) {
    logger.error('Error fetching routes:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Mendapatkan satu route berdasarkan ID, termasuk detail lengkap controller-nya.
 */
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await Route.findByPk(id, {
      include: [{
        model: Controller,
        as: 'controller',
        include: [{ // Kita bisa melakukan nested include untuk melihat DB connection dari controller
            model: DatabaseConnection,
            as: 'databaseConnection',
            attributes: ['id', 'connection_name']
        }]
      }]
    });
    if (!route) {
      return res.status(404).json({ message: "Route not found." });
    }
    res.status(200).json({ data: route });
  } catch (error) {
    logger.error(`Error fetching route ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Memperbarui route.
 */
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { controllerId } = req.body;

    // Validasi jika user mencoba mengubah controllerId
    if (controllerId) {
      const controllerExists = await Controller.findByPk(controllerId);
      if (!controllerExists) {
        return res.status(404).json({ message: `Controller with ID ${controllerId} not found.` });
      }
    }

    const [updated] = await Route.update(req.body, { where: { id: id } });
    if (updated) {
      const updatedRoute = await Route.findByPk(id);
      res.status(200).json({
        message: "Route updated successfully.",
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

/**
 * Menghapus route.
 */
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Route.destroy({ where: { id: id } });
    if (deleted) {
      res.status(200).json({ message: "Route deleted successfully." });
    } else {
      res.status(404).json({ message: "Route not found." });
    }
  } catch (error) {
    logger.error(`Error deleting route ${req.params.id}:`, error);
    res.status(500).json({ error: error.message });
  }
};