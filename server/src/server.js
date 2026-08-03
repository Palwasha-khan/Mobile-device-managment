import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

import http from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected via socket:", socket.id);

  socket.on("register-device", (deviceId) => {
    socket.join(`device-${deviceId}`);
    console.log(`Socket ${socket.id} registered as device-${deviceId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
 
app.set("io", io);

const PORT = process.env.PORT || 4000;  
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});