import { Schema } from "mongoose";

// Add to your Product model
const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  shipmentId: { type: Schema.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
});
