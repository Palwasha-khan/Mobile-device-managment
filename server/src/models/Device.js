import mongoose from "mongoose"; 

const deviceSchema = new mongoose.Schema(
  {
    employeeName: {
         type: String,
          required: true, 
          trim: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 },
    deviceId: { 
        type: String, 
        required: true, 
        unique: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    }, 
  },
  { timestamps: true }
);
 

export default mongoose.model("Device", deviceSchema);