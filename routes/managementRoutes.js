const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');

// --- Database Connection Routes ---
router.post('/database-connections', managementController.createDbConnection);
router.get('/database-connections', managementController.getAllDbConnections);
router.get('/database-connections/:id', managementController.getDbConnectionById);
router.put('/database-connections/:id', managementController.updateDbConnection);
router.delete('/database-connections/:id', managementController.deleteDbConnection);

// New route to test DB connection
// --- Health Check / Testing Routes ---
router.get('/test-db-connection', managementController.testDbConnection);

// --- Database Connection Routes ---
router.post('/database-connections', managementController.createDbConnection);

// --- Controller Routes ---
router.post('/controllers', managementController.createController);
router.get('/controllers', managementController.getAllControllers);
router.get('/controllers/:id', managementController.getControllerById);
router.put('/controllers/:id', managementController.updateController);
router.delete('/controllers/:id', managementController.deleteController);

// --- Route Routes ---
router.post('/routes', managementController.createRoute);
router.get('/routes', managementController.getAllRoutes);
router.get('/routes/:id', managementController.getRouteById);
router.put('/routes/:id', managementController.updateRoute); // <-- INI YANG DIPERBAIKI
router.delete('/routes/:id', managementController.deleteRoute);

module.exports = router;