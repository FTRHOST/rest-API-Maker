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
sequelize.sync({ force: true }).then(async () => { // jadikan callback ini async
  logger.info("Database synced successfully.");

  // Muat dan registrasikan semua route dinamis dari database
  await initializeDynamicRoutes(app); 

  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });

}).catch(err => {
  logger.error('Failed to sync database:', err);
});