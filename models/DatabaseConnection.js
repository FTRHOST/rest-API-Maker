const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DatabaseConnection = sequelize.define('DatabaseConnection', {
  connection_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  db_type: {
    type: DataTypes.ENUM('mysql', 'postgresql', 'sqlite'),
    allowNull: false
  },
  host: {
    type: DataTypes.STRING
  },
  user: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING // Di dunia nyata, ini harus dienkripsi
  },
  database_name: {
    type: DataTypes.STRING
  }
});

module.exports = DatabaseConnection;