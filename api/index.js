import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Initiate database connection and sync products on cold start
connectDB().then(async (ok) => {
  if (ok) {
    try {
      const { syncProductsFromMySQL } = await import('../server/src/data/mockProductStore.js');
      const { syncCategoriesFromMySQL } = await import('../server/src/data/mockCategoryStore.js');
      const { syncOrdersFromMySQL } = await import('../server/src/data/mockOrderStore.js');
      await syncProductsFromMySQL();
      await syncCategoriesFromMySQL();
      await syncOrdersFromMySQL();
    } catch (e) {
      console.warn('⚠️ [Vercel Sync] Warning:', e.message);
    }
  }
}).catch((err) => {
  console.warn('⚠️ [Vercel Function] Database connection notice:', err.message);
});

export default app;
