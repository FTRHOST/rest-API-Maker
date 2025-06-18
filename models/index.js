const sequelize = require('../config/database');
const DatabaseConnection = require('./DatabaseConnection');
const Controller = require('./Controller');
const Route = require('./Route');

// Mendefinisikan relasi antar model
// Satu Route akan menjalankan satu Controller
Route.belongsTo(Controller, {
  foreignKey: 'controllerId',
  as: 'controller'
});
Controller.hasMany(Route, { as: 'routes' });

// Satu Controller menggunakan satu koneksi database
Controller.belongsTo(DatabaseConnection, {
  foreignKey: 'dbConnectionId',
  as: 'databaseConnection'
});
DatabaseConnection.hasMany(Controller, { as: 'controllers' });


// Ekspor semua model dan instance sequelize
module.exports = {
  sequelize,
  DatabaseConnection,
  Controller,
  Route
};