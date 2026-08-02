import mongoose from "mongoose";

const permissionLogSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    permissions: {
      type: String,
      enum: ["camera", "microphone", "location"],
      required: true,
    },
    oldState: {
      type: String,
      enum: ["granted", "denied", "unknown"],  
      required: true,
    },
    newState: {
      type: String,
      enum: ["granted", "denied", "unknown"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

permissionLogSchema.index({ device: 1, timestamp: -1 });

export default mongoose.model("PermissionLog", permissionLogSchema);