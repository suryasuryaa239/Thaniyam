import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

// Production Static Client Serving & SPA Catch-all (for standalone node / container)
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
