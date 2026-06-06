import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { sweepExpiredDeletions } from './src/controllers/adminController.js';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  // Auto-approve account deletions older than 3 days — run now + hourly
  sweepExpiredDeletions();
  setInterval(sweepExpiredDeletions, 60 * 60 * 1000);
});
