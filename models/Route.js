const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Route = sequelize.define('Route', {
  http_method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Route;