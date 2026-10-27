import mongoose from 'mongoose';

let dbStatus = 'disconnected';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    dbStatus = 'not_configured';
    console.log('ℹ️ [Database] MONGODB_URI not found in environment. Running in disconnected mode.');
    return false;
  }

  try {
    console.log('🔄 [Database] Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout so server startup is not blocked if DB is offline
    });
    dbStatus = 'connected';
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    dbStatus = 'disconnected';
    console.warn(`⚠️ [Database] MongoDB connection failed: ${error.message}`);
    console.log('ℹ️ [Database] Server will continue running without an active database connection.');
    return false;
  }
};

export const getDBStatus = () => {
  // mongoose.connection.readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const readyStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const state = mongoose.connection.readyState;
  return readyStates[state] || dbStatus;
};
