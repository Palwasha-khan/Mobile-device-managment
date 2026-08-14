import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    commandType: {
      type: String,
      enum: ["ring_alert", "lock_warning", "compliance_warning"],
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered"],
      default: "sent",
    },
    clearedByEmployee: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Command", commandSchema);