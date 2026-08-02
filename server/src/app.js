 import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser"; 
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import dotenv from 'dotenv';
dotenv.config()

const app = express();


app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, 
  })
);
app.use(express.json());
app.use(cookieParser()); // REQUIRED - populates req.cookies

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}


app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);

app.use(notFound);
app.use(errorHandler);

 

export default app;