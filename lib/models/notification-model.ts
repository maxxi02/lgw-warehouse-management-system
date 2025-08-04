// models/notification.ts
import { Schema, model, models, Document } from "mongoose";

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  message: string;
  read: boolean;
  shipmentId?: Schema.Types.ObjectId;
  type: "shipment" | "delivery" | "general";
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    type: {
      type: String,
      enum: ["shipment", "delivery", "general"],
      default: "shipment",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification =
  models.Notification ||
  model<INotification>("Notification", notificationSchema);

export default Notification;
