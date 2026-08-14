import Device from "../models/Device.js";
import LocationLog from "../models/LocationLog.js";
import PermissionLog from "../models/PermissionLog.js";
import Command from "../models/Command.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { approvalEmailTemplate, rejectionEmailTemplate } from "../utils/emailTemplates.js";
import { Expo } from "expo-server-sdk";
const expo = new Expo();

// ---------- Admin approval workflow ---------

// @desc    Get pending registration request count
// @route   GET /api/device/pending-count
// @access  Private (Admin)
export const getPendingCount = asyncHandler(async (req, res) => {
  const count = await Device.countDocuments({ status: "pending" });
  res.status(200).json({ count });
});


// @route   GET /api/device/pending
// @access  Private (admin)
export const getPendingDevices = asyncHandler(async (req, res) => {
  const pending = await Device.find({ status: "pending" })
  .select("-password")
  .lean();
  res.status(200).json({ devices: pending });
});

// @route   POST /api/device/:id/approve
// @access  Private (admin)
export const approveDevice = asyncHandler(async (req, res) => {
  const device = await Device.findById(req.params.id);
  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  device.status = "approved";
  await device.save();

  await sendEmail({
    to: device.email,
    subject: "Your MDM account has been approved",
    html: approvalEmailTemplate(device.employeeName),
  });

  res.status(200).json({ message: "Employee approved", device });
});

// @route   POST /api/device/:id/reject
// @access  Private (admin)
export const rejectDevice = asyncHandler(async (req, res) => {
  const device = await Device.findById(req.params.id);
  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  device.status = "rejected";
  await device.save();

  await sendEmail({
    to: device.email,
    subject: "Your MDM registration was declined",
    html: rejectionEmailTemplate(device.employeeName),
  });

  res.status(200).json({ message: "Employee rejected", device });
});
 
 
// ---------- Ping + compliance engine ----------

// @route   POST /api/device/ping
// @access  Private (employee)
export const sendPing = asyncHandler(async (req, res) => {
  const { lat, lng, cameraPermission, microphonePermission } = req.body;
  const now = new Date();

  const existingDevice = await Device.findById(req.auth.id);
  if (!existingDevice) {
    res.status(404);
    throw new Error("Device not found");
  }

  const newCamera = cameraPermission || existingDevice?.permissions.camera;
  const newMicrophone =
    microphonePermission || existingDevice?.permissions.microphone;
  const locationServiceActive = true;  
 
  const isCompliant =
    newCamera === "granted" &&
    newMicrophone === "granted" &&
    locationServiceActive;

  const device = await Device.findByIdAndUpdate(
    req.auth.id,
    {
      $set: {
        lastKnownLocation: { lat, lng },
        lastPingAt: now,
        permissions: {
          camera: newCamera,
          microphone: newMicrophone,
          locationServiceActive,
        },
        isCompliant,
      }
    },
    { new: true, runValidators: true }
  ); 
  const changes = [];
  const oldCamera = existingDevice?.permissions?.camera || "denied";
const oldMicrophone = existingDevice?.permissions?.microphone || "denied";
 

if (oldCamera !== newCamera) {
  changes.push({
    device: device._id,
    permissions: "camera",
    oldState: oldCamera,
    newState: newCamera,
    timestamp: now,
  });
}

if (oldMicrophone !== newMicrophone) {
  changes.push({
    device: device._id,
    permissions: "microphone",
    oldState: oldMicrophone,
    newState: newMicrophone,
    timestamp: now,
  });
}


  if (changes.length > 0) {
    await PermissionLog.insertMany(changes);
  }

  await LocationLog.create({ device: device._id, lat, lng, timestamp: now });

  // Broadcast to connected admin dashboards
  const io = req.app.get("io");
  if (io) {
    io.emit("device-update", {
      _id: device._id,
      employeeName: device.employeeName,
      deviceId: device.deviceId,
      lastKnownLocation: device.lastKnownLocation,
      lastPingAt: device.lastPingAt,
      isCompliant: device.isCompliant,
      permissions: device.permissions,
    });
  } 

  res.status(200).json({
    message: "Ping received",
    device: {
      id: device._id,
      deviceId: device.deviceId,
      lastKnownLocation: device.lastKnownLocation,
      lastPingAt: device.lastPingAt,
      isCompliant: device.isCompliant,
      permissions: device.permissions,
    },
  });
});

// ---------- Device list + history ----------

// @route   GET /api/device
// @access  Private (admin)
export const getAllDevices = asyncHandler(async (req, res) => {
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { status: "approved"};

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [{ employeeName: searchRegex }, { email: searchRegex }];
  }

  if (req.query.compliance === "compliant") {
    filter.isCompliant = true;
  } else if (req.query.compliance === "non-compliant") {
    filter.isCompliant = false;
  }

  const [devices, totalCount] = await Promise.all([
    Device.find(filter)
      .select("-password")
      .sort({ employeeName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),  
    Device.countDocuments(filter),
  ]);

  res.status(200).json({
    devices,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

// @route   GET /api/device/:id/history
// @access  Private (admin)
export const getDeviceHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await Device.findById(id).select("-password");
  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  const locationHistory = await LocationLog.find({ device: id })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  const permissionHistory = await PermissionLog.find({ device: id })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  res.status(200).json({ device, locationHistory, permissionHistory });
});

export const getDeviceStats = asyncHandler(async (req, res) => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

  const [totalDevices, activeDevices, compliantDevices, pendingDevices] =
    await Promise.all([
      Device.countDocuments({ status: "approved" }),
      Device.countDocuments({ status: "approved", lastPingAt: { $gte: fifteenMinutesAgo } }),
      Device.countDocuments({ status: "approved", isCompliant: true }),
      Device.countDocuments({ status: "pending" }),
    ]);

  res.status(200).json({
    totalDevices,
    activeDevices,
    compliantDevices,
    nonCompliantDevices: totalDevices - compliantDevices,
    pendingDevices,
  });
});

// ---------- Remote commands ----------

// @route   POST /api/device/:id/command
// @access  Private (admin)
export const sendCommand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { commandType } = req.body;

  const device = await Device.findById(id);
  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  const command = await Command.create({
    device: id,
    commandType,
    issuedBy: req.auth.id,
    status: "sent",
  });

  const io = req.app.get("io");
  if (io) {
    io.to(`device-${id}`).emit("command", {
      commandType,
      issuedAt: command.createdAt,
    });
    
    if (device.pushToken && Expo.isExpoPushToken(device.pushToken)) {
  const commandLabels = {
    ring_alert: "Device Alert",
    lock_warning: "Security Warning",
    compliance_warning: "Compliance Warning",
  };

  await expo.sendPushNotificationsAsync([
    {
      to: device.pushToken,
      sound: "default",
      title: commandLabels[commandType] || "Admin Command",
      body: "Tap to open the app and see details.",
      data: { commandType },
    },
  ]);
}
  }

  res.status(200).json({ message: "Command sent", command });
});

// @route   GET /api/device/my-commands
// @desc    Returns the logged-in employee's own command history
// @access  Private (employee)
export const getMyCommands = asyncHandler(async (req, res) => {
  const commands = await Command.find({
    device: req.auth.id,
    clearedByEmployee: { $ne: true },
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({ commands });
});

// @route   PATCH /api/device/my-commands/clear-all
// @desc    Employee clears their own notification list (doesn't delete
//          the underlying record - admin's audit trail stays intact)
// @access  Private (employee)
export const clearMyCommands = asyncHandler(async (req, res) => {
  await Command.updateMany(
    { device: req.auth.id },
    { clearedByEmployee: true }
  );

  res.status(200).json({ message: "Notifications cleared" });
});

// @route   DELETE /api/device/my-commands/:commandId
// @desc    Employee clears a single notification
// @access  Private (employee)
export const clearOneCommand = asyncHandler(async (req, res) => {
  const command = await Command.findOne({
    _id: req.params.commandId,
    device: req.auth.id, 
  });

  if (!command) {
    res.status(404);
    throw new Error("Notification not found");
  }

  command.clearedByEmployee = true;
  await command.save();

  res.status(200).json({ message: "Notification cleared" });
});
// @route   POST /api/device/push-token
// @access  Private (admin)
export const updatePushToken = asyncHandler(async (req, res) => {
  const { pushToken } = req.body;

  const device = await Device.findByIdAndUpdate(req.auth.id, { pushToken }, { new: true });

  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  res.status(200).json({ message: "Push token saved" });
});

// ---------- Admin edit ----------

// @route   PUT /api/device/:id
// @access  Private (admin)
export const updateDevice = asyncHandler(async (req, res) => {
  const { employeeName, email, deviceId, status } = req.body;

  const device = await Device.findById(req.params.id);
  if (!device) {
    res.status(404);
    throw new Error("Device not found");
  }

  if (employeeName) device.employeeName = employeeName;
  if (email) device.email = email;
  if (deviceId) device.deviceId = deviceId;
  if (status) device.status = status; // lets admin manually flip status too

  await device.save();

  res.status(200).json({ message: "Device updated", device });
});