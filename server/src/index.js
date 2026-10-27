import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from './config/db.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      configured: Boolean(process.env.MONGODB_URI),
      message: dbStatus === 'connected' 
        ? 'Connected to MongoDB' 
        : 'MongoDB is not connected. The backend is running in resilient store mode.'
    },
    timestamp: new Date().toISOString()
  });
});

// Production Static Client Serving & SPA Catch-all
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`🌐 [Static Serving] Serving production frontend build from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA direct URL opening and page refresh fallback (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start server and initialize database connection attempt
const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`🌿 Thaniyam Treats API server is running on http://localhost:${PORT}`);
    console.log(`🩺 Health check route: http://localhost:${PORT}/api/health`);
  });

  // Attempt database connection without blocking API server startup
  await connectDB();
};

startServer();
