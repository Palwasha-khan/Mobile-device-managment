import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Device from "../models/Device.js";
import crypto, { hash } from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { refreshTokenCookieOptions } from "../utils/cookieOptions.js";
import { comparePassword, hashPassword, hashToken } from "../utils/crypto.js";

// @route   POST /api/auth/login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body; 

  const user = await User.findOne({ email });
 if (!user || !(await comparePassword(password, user.password))){
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user._id, "admin");
  const refreshToken = generateRefreshToken(user._id, "admin");

   user.refreshTokenHash =await hashToken(refreshToken);
  await user.save();

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc   Promote an employee (Device user) to Admin
// @route   POST /api/admin/promote/:id
// @access  Private (Admin only)
export const promoteEmployeeToAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await Device.findById(id);
    if (!device) {
      res.status(404);
      throw new Error("Device not found");
    }
 
  const userExists = await User.findOne({ email:device.email });
  if (userExists) {
    res.status(400);
    throw new Error('an admin account with this email already exists');
  }
 const newAdmin = await User.create({
      name: device.employeeName,
      email: device.email,
      password: device.password,  
      role: "admin",
    })

  res.status(201).json({
    message: 'New admin successfully created',
    admin: {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  });
});

// @desc    change admin password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.auth.id);
  if (!user) {
    res.status(404);
    throw new Error("Account not found");
  }

  const isMatch =  await comparePassword(currentPassword,user.password)
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
    

  user.password = await hashPassword(newPassword)
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
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

  const hashedPassword = await hashPassword(password)

  const device = await Device.create({
    employeeName,
    email,
    password: hashedPassword,
    deviceId,
    status: "pending",
  });

  const io = req.app.get("io");
  if (io) { 
    io.emit("new-device-request", {
      deviceId: device.deviceId,
      employeeName: device.employeeName,
      status: device.status,
    });
  }
  res.status(201).json({
    message: "Registration submitted. An admin must approve your account before you can log in.",
    device: { id: device._id, employeeName: device.employeeName, status: device.status },
  });
});

// @route   POST /api/auth/employee-login
export const employeeLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

 const device = await Device.findOne({ email });
  if (!device || !(await comparePassword(password, device.password))) {
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

   device.refreshTokenHash = hashToken(refreshToken);
   await device.save();

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    accessToken,
    refreshToken,
    device: { id: device._id, employeeName: device.employeeName, deviceId: device.deviceId, status: device.status },
  });
});

// @route   POST /api/auth/refresh-token
export const refreshToken = asyncHandler(async (req, res) => { 
  const incomingToken = req.cookies.refreshToken 

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

  if (!account || !account.refreshTokenHash) {
    res.status(401);
    throw new Error("Refresh token invalid - please log in again");
  }
 
  if (hashToken(incomingToken) !== account.refreshTokenHash) {
    res.status(401);
    throw new Error("Refresh token invalid - please log in again");
  }

  const newAccessToken = generateAccessToken(account._id, decoded.role);
  const newRefreshToken = generateRefreshToken(account._id, decoded.role);

  account.refreshTokenHash = hashToken(newRefreshToken);
  await account.save();

  res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  if (incomingToken) {
    try {
      const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
      const Model = decoded.role === "admin" ? User : Device;
      await Model.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
    } catch (error) {
      // already invalid/expired - nothing to revoke, that's fine
    }
  }

  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.status(200).json({ message: "Logged out" });
});