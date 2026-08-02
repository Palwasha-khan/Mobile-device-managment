import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Device from "../models/Device.js";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { refreshTokenCookieOptions } from "../utils/cookieOptions.js";

// @route   POST /api/auth/login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("REQ BODY:", req.body);

  const user = await User.findOne({ email });
  const  hashedpassword = crypto.createHash("sha256").update(password).digest("hex");
  if (!user ||  hashedpassword !== user.password) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user._id, "admin");
  const refreshToken = generateRefreshToken(user._id, "admin");

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Create a new admin user directly
// @route   POST /api/admin/create-admin
// @access  Private (Admin only)
export const createNewAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

  // Create new user explicitly set to 'admin' role
  const adminUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
  });

  res.status(201).json({
    message: 'New admin successfully created',
    admin: {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    },
  });
});

// @desc    Get current user's information
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.auth.id; 

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @route   POST /api/auth/employee-register
export const employeeRegister = asyncHandler(async (req, res) => {
  const { employeeName, email, password, deviceId } = req.body;

  const existing = await Device.findOne({ $or: [{ email }, { deviceId }] });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email or device ID already exists");
  }

  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

  const device = await Device.create({
    employeeName,
    email,
    password: hashedPassword,
    deviceId,
    status: "pending",
  });

  res.status(201).json({
    message: "Registration submitted. An admin must approve your account before you can log in.",
    device: { id: device._id, employeeName: device.employeeName, status: device.status },
  });
});

// @route   POST /api/auth/employee-login
export const employeeLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const device = await Device.findOne({ email });
   const  hashedpassword = crypto.createHash("sha256").update(password).digest("hex");
  if (!device ||  hashedpassword !== device.password) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (device.status === "pending") {
    res.status(403);
    throw new Error("Your account is awaiting admin approval");
  }
  if (device.status === "rejected") {
    res.status(403);
    throw new Error("Your registration was declined. Please contact IT.");
  }

  const accessToken = generateAccessToken(device._id, "employee");
  const refreshToken = generateRefreshToken(device._id, "employee");

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    accessToken,
    device: { id: device._id, employeeName: device.employeeName, deviceId: device.deviceId, status: device.status },
  });
});

// @route   POST /api/auth/refresh-token
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Refresh token invalid or expired - please log in again");
  }

  const Model = decoded.role === "admin" ? User : Device;
  const account = await Model.findById(decoded.id);

  if (!account) {
    res.status(401);
    throw new Error("Refresh token invalid - please log in again");
  }
 

  const newAccessToken = generateAccessToken(account._id, decoded.role);
  const newRefreshToken = generateRefreshToken(account._id, decoded.role);

  res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

  res.status(200).json({ accessToken: newAccessToken });
});

// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken;

  if (!incomingToken) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Refresh token invalid or expired - please log in again");
  }

  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.status(200).json({ message: "Logged out" });
});