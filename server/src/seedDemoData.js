// Run once with: node src/seedDemoData.js
// Creates a realistic spread of pending/approved/rejected employees,
// with mixed compliance states and locations across major Pakistani cities

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Device from "./models/Device.js";
import { hashPassword } from "./utils/crypto.js";

const cities = [
  { name: "Lahore", lat: 31.5497, lng: 74.3436 },
  { name: "Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "Islamabad", lat: 33.6844, lng: 73.0479 },
  { name: "Faisalabad", lat: 31.4181, lng: 73.0776 },
  { name: "Rawalpindi", lat: 33.5651, lng: 73.0169 },
  { name: "Multan", lat: 30.1575, lng: 71.5249 },
  { name: "Peshawar", lat: 34.0151, lng: 71.5249 },
];

// Small random offset so devices in the same city don't sit on the exact
// same coordinate (good for testing clustering too)
const jitter = (value) => value + (Math.random() - 0.5) * 0.05;

const firstNames = ["Ali", "Sara", "Ahmed", "Ayesha", "Bilal", "Hina", "Usman", "Zainab", "Hamza", "Mariam", "Fahad", "Nida", "Omar", "Sana", "Tariq"];
const lastNames = ["Khan", "Malik", "Chaudhry", "Butt", "Sheikh", "Raza", "Iqbal", "Ahmed", "Yousaf", "Farooq"];

const randomName = () => `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
const randomCity = () => cities[Math.floor(Math.random() * cities.length)];
const minutesAgo = (mins) => new Date(Date.now() - mins * 60 * 1000);

const seedDemoData = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await hashPassword("demo123");
  let counter = 1;

  const devicesToCreate = [];

  // 8 approved, compliant, recently active - green pins, active
  for (let i = 0; i < 8; i++) {
    const city = randomCity();
    devicesToCreate.push({
      employeeName: randomName(),
      email: `demo.compliant${counter}@company.com`,
      password: hashedPassword,
      deviceId: `DEV-${String(counter).padStart(3, "0")}`,
      status: "approved",
      isCompliant: true,
      lastKnownLocation: { lat: jitter(city.lat), lng: jitter(city.lng) },
      lastPingAt: minutesAgo(Math.random() * 10),
      permissions: { camera: "granted", microphone: "granted", locationServiceActive: true },
    });
    counter++;
  }

  // 5 approved, NON-compliant, recently active - red pins, active
  for (let i = 0; i < 5; i++) {
    const city = randomCity();
    devicesToCreate.push({
      employeeName: randomName(),
      email: `demo.noncompliant${counter}@company.com`,
      password: hashedPassword,
      deviceId: `DEV-${String(counter).padStart(3, "0")}`,
      status: "approved",
      isCompliant: false,
      lastKnownLocation: { lat: jitter(city.lat), lng: jitter(city.lng) },
      lastPingAt: minutesAgo(Math.random() * 10),
      permissions: { camera: "denied", microphone: "granted", locationServiceActive: true },
    });
    counter++;
  }

  // 4 approved, but INACTIVE (stale ping, >15 min ago) - grayed out pins
  for (let i = 0; i < 4; i++) {
    const city = randomCity();
    devicesToCreate.push({
      employeeName: randomName(),
      email: `demo.inactive${counter}@company.com`,
      password: hashedPassword,
      deviceId: `DEV-${String(counter).padStart(3, "0")}`,
      status: "approved",
      isCompliant: Math.random() > 0.5,
      lastKnownLocation: { lat: jitter(city.lat), lng: jitter(city.lng) },
      lastPingAt: minutesAgo(60 + Math.random() * 500), // 1-9 hours ago
      permissions: { camera: "granted", microphone: "denied", locationServiceActive: true },
    });
    counter++;
  }

  // 5 pending approval - show up in Pending Approvals page
  for (let i = 0; i < 5; i++) {
    devicesToCreate.push({
      employeeName: randomName(),
      email: `demo.pending${counter}@company.com`,
      password: hashedPassword,
      deviceId: `DEV-${String(counter).padStart(3, "0")}`,
      status: "pending",
      isCompliant: false,
      permissions: { camera: "unknown", microphone: "unknown", locationServiceActive: false },
    });
    counter++;
  }

  // 2 rejected - proves the rejection flow exists, shouldn't show on
  // dashboard/devices list per our earlier "approved only" fix
  for (let i = 0; i < 2; i++) {
    devicesToCreate.push({
      employeeName: randomName(),
      email: `demo.rejected${counter}@company.com`,
      password: hashedPassword,
      deviceId: `DEV-${String(counter).padStart(3, "0")}`,
      status: "rejected",
      isCompliant: false,
      permissions: { camera: "unknown", microphone: "unknown", locationServiceActive: false },
    });
    counter++;
  }

  await Device.insertMany(devicesToCreate);

  console.log(`Created ${devicesToCreate.length} demo devices:`);
  console.log("- 8 approved + compliant + active");
  console.log("- 5 approved + non-compliant + active");
  console.log("- 4 approved + inactive (stale ping)");
  console.log("- 5 pending approval");
  console.log("- 2 rejected");
  console.log("\nAll demo accounts use password: demo123");

  process.exit(0);
};

seedDemoData().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});