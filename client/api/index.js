import app from '../api-server/app.js';
import { connectDB } from '../api-server/config/db.js';

// Initiate database connection attempt without blocking serverless function execution
connectDB()
  .then(async (isOk) => {
    if (isOk) {
      try {
        const { syncProductsFromMySQL } = await import('../api-server/data/mockProductStore.js');
        const { syncOrdersFromMySQL } = await import('../api-server/data/mockOrderStore.js');
        await syncProductsFromMySQL();
        await syncOrdersFromMySQL();
      } catch (e) {
        console.warn('⚠️ [Vercel Function] MySQL sync warning:', e.message);
      }
    }
  })
  .catch((err) => {
    console.warn('⚠️ [Vercel Function] Database connection notice:', err.message);
  });

export default app;
