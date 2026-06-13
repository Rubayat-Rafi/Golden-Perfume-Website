import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { sweepExpiredDeletions } from './src/controllers/adminController.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[server] running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  sweepExpiredDeletions();
  setInterval(sweepExpiredDeletions, 60 * 60 * 1000);
}).catch((err) => {
  console.error('[server] failed to connect to DB:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('[server] unhandledRejection:', err);
});
