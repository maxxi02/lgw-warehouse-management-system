import { Db, MongoClient } from "mongodb";
import mongoose from "mongoose";

let isConnected = false;
let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

// Initialize client and db only when needed
export function getMongoClient(): MongoClient {
  if (!client) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not configured");
    }
    client = new MongoClient(MONGODB_URI);
  }
  return client;
}

export function getDB(): Db {
  if (!db) {
    const mongoClient = getMongoClient();
    const dbName = process.env.MONGODB_DATABASE || "lgw-warehouse";
    db = mongoClient.db(dbName);
  }
  return db;
}
