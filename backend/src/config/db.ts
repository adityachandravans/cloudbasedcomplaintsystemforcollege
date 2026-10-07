import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  if (mongoose.connection.readyState === 1) {
    return 'Already connected';
  }

  const mongoUri = process.env.MONGODB_URI;

  try {
    if (mongoUri && mongoUri !== 'memory' && mongoUri.trim() !== '') {
      console.log('Attempting to connect to MongoDB URI...');
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected successfully via URI');
      return mongoUri;
    }
  } catch (error) {
    console.warn('Failed to connect to provided MONGODB_URI. Falling back to embedded MongoDB Memory Server...', error);
  }

  // Fallback to MongoMemoryServer if no URI or connection failed
  try {
    console.log('Initializing embedded MongoDB Memory Server for local development/demo...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`MongoDB Memory Server connected at: ${uri}`);
    return uri;
  } catch (err) {
    console.error('Failed to start MongoDB Memory Server:', err);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
