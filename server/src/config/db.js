import mongoose from 'mongoose';
import { initMySQL, isMySQLConnected } from './mysqlStore.js';

let dbStatus = 'disconnected';

const DEFAULT_TIDB_URL = 'mysql://4HnjcQp8BkMrr3m.root:sx2NuvR3HX6RowZl@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/Thaniyam';

export const connectDB = async () => {
  const mysqlUri = process.env.DATABASE_URL || process.env.MYSQL_URI || DEFAULT_TIDB_URL;
  const mongoUri = process.env.MONGODB_URI;

  // 1. Prioritize TiDB / MySQL if configured
  if (mysqlUri && mysqlUri.startsWith('mysql')) {
    console.log('🔄 [Database] Attempting to connect to TiDB Cloud MySQL...');
    const ok = await initMySQL();
    if (ok) {
      dbStatus = 'connected_mysql';
      return true;
    }
  }

  // 2. Connect to MongoDB if configured
  if (mongoUri) {
    try {
      console.log('🔄 [Database] Attempting to connect to MongoDB...');
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2500,
      });
      dbStatus = 'connected_mongo';
      console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ [Database] MongoDB connection failed: ${error.message}`);
    }
  }

  if (!mysqlUri && !mongoUri) {
    dbStatus = 'not_configured';
    console.log('ℹ️ [Database] Neither DATABASE_URL nor MONGODB_URI configured. Running in resilient memory store mode.');
    return false;
  }

  dbStatus = 'disconnected';
  console.log('ℹ️ [Database] Server will continue running with resilient memory store fallback.');
  return false;
};

export const getDBStatus = () => {
  if (isMySQLConnected()) return 'connected (TiDB Cloud MySQL)';
  if (mongoose.connection && mongoose.connection.readyState === 1) return 'connected (MongoDB)';
  return dbStatus;
};
