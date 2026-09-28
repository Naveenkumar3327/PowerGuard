import mongoose from 'mongoose';
import { config } from './environment';

export let isConnectedToDb = false;

export async function connectDatabase(): Promise<void> {
  const uri = config.mongodbUri;

  if (uri) {
    try {
      console.log(`[Database] Connecting to MongoDB: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnectedToDb = true;
      console.log('[Database] Successfully connected to MongoDB Atlas / Local MongoDB.');
      return;
    } catch (err: any) {
      console.warn(`[Database] Failed to connect to configured MongoDB URI: ${err.message}`);
      console.warn('[Database] Initializing resilient in-memory storage fallback mode.');
    }
  } else {
    console.log('[Database] No MONGODB_URI provided in environment. Running in resilient zero-config mode.');
  }

  // Fallback: Memory server or local fallback
  try {
    // Attempt local default if mongod happens to run
    await mongoose.connect('mongodb://localhost:27017/powerguard', {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToDb = true;
    console.log('[Database] Connected to local MongoDB instance.');
  } catch {
    console.log('[Database] Notice: Operating in high-performance in-memory simulation mode.');
    isConnectedToDb = false;
  }
}
