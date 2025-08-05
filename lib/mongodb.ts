import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

let isConnected = false;

export async function connectDB() {
  if (isConnected || !MONGODB_URI) {
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

// Optional: if you need native MongoDB client
export const client = new MongoClient(MONGODB_URI);
export const db = client?.db("test");
