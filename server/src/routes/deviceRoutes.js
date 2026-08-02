import express from "express";
import {
  getPendingDevices,
  approveDevice,
  rejectDevice,
  sendPing,
  getAllDevices,
  getDeviceHistory,
  sendCommand,
  updateDevice,
} from "../controllers/deviceController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  pingRules,
  commandRules,
  updateDeviceRules,
} from "../validators/deviceValidators.js";

const router = express.Router();

// Admin approval workflow
router.get("/pending", protect, requireRole("admin"), getPendingDevices);
router.patch("/:id/approve", protect, requireRole("admin"), approveDevice);
router.patch("/:id/reject", protect, requireRole("admin"), rejectDevice);

// Employee ping
router.post("/ping", protect, requireRole("employee"), pingRules, sendPing);

// Admin device management
router.get("/devices", protect, requireRole("admin"), getAllDevices);
router.get("/:id/history", protect, requireRole("admin"), getDeviceHistory);
router.post(
  "/:id/command",
  protect,
  requireRole("admin"),
  commandRules,
  sendCommand
);
router.put(
  "/:id",
  protect,
  requireRole("admin"),
  updateDeviceRules,
  updateDevice
);

export default router;