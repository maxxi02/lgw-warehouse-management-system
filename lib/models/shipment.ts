// models/shipment.ts
import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productImage: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    // Delivery personnel information
    deliveryPersonnel: {
      id: {
        type: String,
        required: [true, "Delivery personnel ID is required"],
      },
      fullName: {
        type: String,
        required: [true, "Delivery personnel full name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Delivery personnel email is required"],
        trim: true,
        lowercase: true,
      },
    },
    destination: {
      type: String,
      required: [true, "Destination address is required"],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in-transit",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    // Tracking information
    trackingDetails: {
      assignedDate: {
        type: Date,
        default: Date.now,
      },
      shippedDate: {
        type: Date,
      },
      deliveredDate: {
        type: Date,
      },
      estimatedDelivery: {
        type: Date,
      },
    },
    // Who marked this for shipment
    markedBy: {
      name: {
        type: String,
        required: [true, "Marker name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Marker email is required"],
        trim: true,
      },
      role: {
        type: String,
        required: [true, "Marker role is required"],
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
shipmentSchema.index({ productId: 1 });
shipmentSchema.index({ "deliveryPersonnel.id": 1 });
shipmentSchema.index({ "deliveryPersonnel.email": 1 });
shipmentSchema.index({ status: 1 });

// Compound indexes
shipmentSchema.index({ status: 1, "deliveryPersonnel.id": 1 });
shipmentSchema.index({ productId: 1, status: 1 });

export const Shipment =
  mongoose.models.Shipment || mongoose.model("Shipment", shipmentSchema);
