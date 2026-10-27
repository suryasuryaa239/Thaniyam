import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDBStatus } from './config/db.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

// CORS configuration supporting local dev, custom domain, Vercel & Render deployments
const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = configuredOrigins.includes(origin) || configuredOrigins.includes('*');
    const isVercelOrRender = origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com');
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isExplicitlyAllowed || isVercelOrRender || isLocalhost) {
      return callback(null, true);
    }
    // Allow by default for public e-commerce store
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Basic backend health-check route
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'ok',
    project: 'Thaniyam Treats API',
    version: '1.0.0',
    platform: process.env.VERCEL ? 'Vercel Serverless' : 'Node.js Express Server',
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      configured: Boolean(process.env.DATABASE_URL || process.env.MYSQL_URI || process.env.MONGODB_URI),
      message: dbStatus.startsWith('connected')
        ? `Active Database: ${dbStatus}`
        : 'Database is not connected. The backend is running in resilient store mode.'
    },
    timestamp: new Date().toISOString()
  });
});

export default app;
