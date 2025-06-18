const sequelize = require('../config/database');
const DatabaseConnection = require('./DatabaseConnection');
const Controller = require('./Controller');
const Route = require('./Route');

// --- Definisikan relasi dengan NAMA FOREIGN KEY YANG EKSPLISIT ---

// Satu Route memiliki satu Controller
Route.belongsTo(Controller, {
  foreignKey: 'controllerId', // Gunakan 'c' kecil
  as: 'controller'
});
Controller.hasMany(Route, { 
  foreignKey: 'controllerId', // Gunakan 'c' kecil
  as: 'routes' 
});

// Satu Controller memiliki satu DatabaseConnection
Controller.belongsTo(DatabaseConnection, {
  foreignKey: 'dbConnectionId', // Gunakan 'd' kecil
  as: 'databaseConnection'
});
DatabaseConnection.hasMany(Controller, { 
  foreignKey: 'dbConnectionId', // Gunakan 'd' kecil
  as: 'controllers' 
});

// Ekspor semua model dan instance sequelize
module.exports = {
  sequelize,
  DatabaseConnection,
  Controller,
  Route
};