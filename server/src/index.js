import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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
        : 'MongoDB is not connected. The backend is running without active database connection.'
    },
    timestamp: new Date().toISOString()
  });
});

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
