const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const managementRoutes = require('./routes/managementRoutes');
// Impor middleware baru kita
const { dynamicRouteHandler } = require('./services/dynamicRouter');
const { reloadRoutesCache } = require('./services/routeCache'); // Impor fungsi reload

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 1. Daftarkan route manajemen kita seperti biasa
app.use('/api/management', managementRoutes);

// 2. TEPAT SETELAH ITU, daftarkan middleware dinamis kita
// Middleware ini akan mencoba menangani semua permintaan lainnya.
app.use(dynamicRouteHandler);

// Sinkronisasi database dan jalankan server
sequelize.sync().then(async () => { // Jadikan async lagi
  logger.info("Database synced successfully.");
  
  // Lakukan load awal ke cache saat server startup
  await reloadRoutesCache();

  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });

}).catch(err => {
  logger.error('Failed to sync database:', err);
});