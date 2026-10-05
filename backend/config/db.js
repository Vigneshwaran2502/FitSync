import mongoose from "mongoose";
import { seedDatabase } from "../services/seedService.js";
let mongodInstance = null;
async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/fitsync";
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2e3
    });
    console.log(`[Database] Connected to MongoDB at ${uri}`);
    await seedDatabase();
  } catch (err) {
    console.log(`[Database] Local MongoDB unavailable (${err.message}). Starting embedded MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongodInstance = await MongoMemoryServer.create({
        instance: { dbName: "fitsync" }
      });
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to MongoMemoryServer at ${memoryUri}`);
      await seedDatabase();
    } catch (memErr) {
      console.error("[Database] Failed to start MongoMemoryServer:", memErr);
      throw memErr;
    }
  }
}
async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
export {
  connectDB,
  disconnectDB
};
