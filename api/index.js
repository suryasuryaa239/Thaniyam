import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Initiate database connection attempt without blocking
connectDB().catch((err) => {
  console.warn('⚠️ [Vercel Function] MongoDB connection notice:', err.message);
});

export default app;
