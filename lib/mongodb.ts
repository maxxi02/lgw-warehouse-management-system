import { Db, MongoClient } from "mongodb";
import mongoose from "mongoose";
import { MONGODB_URI } from "./constants/env";

export const client = new MongoClient(process.env.MONGODB_URI || "");
export const db: Db = client.db(
  process.env.MONGODB_DATABASE || "lgw-warehouse"
);

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
