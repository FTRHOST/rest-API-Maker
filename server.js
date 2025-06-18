const express = require('express');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const managementRoutes = require('./routes/managementRoutes');
const { initializeDynamicRoutes } = require('./services/dynamicRouter'); // Import layanan baru

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Gunakan management routes dengan prefix /api/management
app.use('/api/management', managementRoutes);

// Sinkronisasi database dan jalankan server
sequelize.sync({ force: true }).then(async () => {
  logger.info("Database synced successfully.");

  // Muat dan registrasikan semua route dinamis dari database
  await initializeDynamicRoutes(app); 

  const server = app.listen(PORT, () => {
    // Matikan timeout untuk koneksi yang masuk
    server.keepAliveTimeout = 0; 
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
  
  // Secara eksplisit menonaktifkan header x-powered-by
  // dan juga bisa membantu dengan beberapa proxy
  app.disable('x-powered-by');

}).catch(err => {
  logger.error('Failed to sync database:', err);
});