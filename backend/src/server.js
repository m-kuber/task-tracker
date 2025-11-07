const app = require('./app');
const models = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // connect and sync
    await models.sequelize.authenticate();
    console.log('Database connected.');

    // Sync models. In production replace with migrations.
    // Use alter: false to prevent "Too many keys" error in MySQL
    // Tables will be created if they don't exist, but won't be altered
    await models.sequelize.sync({ alter: false });
    console.log('Models synced.');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
