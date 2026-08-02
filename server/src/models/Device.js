import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // --- Added fields for telemetry and ping compliance ---
    permissions: {
      camera: {
        type: String,
        enum: ["granted", "denied", "unknown"],
        default: "denied",
      },
      microphone: {
        type: String,
        enum: ["granted", "denied", "unknown"],
        default: "denied",
      },
      locationServiceActive: {
        type: Boolean,
        default: true,
      },
    },
    lastKnownLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    lastPingAt: {
      type: Date,
    },
    isCompliant: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
deviceSchema.index({ isCompliant: 1 });
deviceSchema.index({ status: 1 });

export default mongoose.model("Device", deviceSchema);