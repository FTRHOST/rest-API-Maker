const express = require('express');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const managementRoutes = require('./routes/managementRoutes');
const { initializeDynamicRoutes } = require('./services/dynamicRouter');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/management', managementRoutes);

// HAPUS { force: true } DARI SINI
sequelize.sync().then(async () => {
  logger.info("Database synced successfully.");

  await initializeDynamicRoutes(app); 

  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });

}).catch(err => {
  logger.error('Failed to sync database:', err);
});
