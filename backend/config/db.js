const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms';
    
    // Attempt standard connection first with a 3-second timeout
    try {
      const conn = await mongoose.connect(connStr, {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (primaryErr) {
      console.log(`[Database] Could not connect to primary MongoDB URI (${connStr}).`);
      console.log('[Database] Starting in-memory MongoDB instance for seamless execution...');
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB at ${memUri}`);
      return conn;
    }
  } catch (err) {
    console.error(`[Database Error] Connection failed: ${err.message}`);
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, closeDB };
