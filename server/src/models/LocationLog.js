import mongoose from "mongoose";

const locationLogSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

locationLogSchema.index({ device: 1, timestamp: -1 });

export default mongoose.model("LocationLog", locationLogSchema);