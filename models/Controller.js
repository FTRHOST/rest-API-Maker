const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Controller = sequelize.define('Controller', {
  function_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  code_body: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

module.exports = Controller;