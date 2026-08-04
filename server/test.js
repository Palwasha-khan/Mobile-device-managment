import { io } from "socket.io-client";

// Replace with a real _id of one of your Device documents (copy it from
// Postman's response when you called GET /api/device, or from MongoDB Atlas)
const FAKE_DEVICE_ID = "6a6edce9ca3fb2a610fdd014";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Fake phone connected:", socket.id);
  socket.emit("register-device", FAKE_DEVICE_ID);
});

socket.on("command", (payload) => {
  console.log("🔔 COMMAND RECEIVED:", payload);
});
