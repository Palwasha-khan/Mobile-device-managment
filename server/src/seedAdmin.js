import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "./models/User.js"; // Adjust path to your User model
import connectDB from "./config/db.js";
import { hashPassword } from "./utils/crypto.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@mail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123";

    // 2. Check if Admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists. Skipping seed.");
      process.exit(0);
    }

    // 3. Hash the admin password
    const hashedPassword = await hashPassword(adminPassword);
    // 4. Create the Admin User
    const adminUser = new User({
      name: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin", // Ensure your User model schema supports a 'role' field
    });

    await adminUser.save();

    console.log(`✅ Admin user created successfully: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding admin user: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();