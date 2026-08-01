import Device from "../models/Device.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { approvalEmailTemplate, rejectionEmailTemplate } from "../utils/emailTemplates.js";

export const getPendingDevices = asyncHandler(async (req, res) => {
  const pending = await Device.find({ status: "pending" }).select("-password");
  res.status(200).json({ devices: pending });
});

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