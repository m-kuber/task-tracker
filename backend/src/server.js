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
    await models.sequelize.sync({ alter: true }); // alter for dev convenience
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
