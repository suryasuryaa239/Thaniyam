import app from '../api-server/app.js';
import { connectDB } from '../api-server/config/db.js';

// Initiate MongoDB connection attempt without blocking serverless function execution
connectDB().catch((err) => {
  console.warn('⚠️ [Vercel Function] MongoDB connection notice:', err.message);
});

export default app;
