import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized - no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.auth = decoded;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized - token invalid or expired");
  }
});

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403);
      throw new Error("Forbidden - insufficient permissions");
    }
    next();
  };
};