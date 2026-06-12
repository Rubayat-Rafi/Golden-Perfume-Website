import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { sweepExpiredDeletions } from './src/controllers/adminController.js';

const PORT = process.env.PORT || 5000;

// ✅ Single connectDB call
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }

  sweepExpiredDeletions();
  setInterval(sweepExpiredDeletions, 60 * 60 * 1000);
});

export default app;