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
  getDeviceStats,
  getPendingCount,
  updatePushToken,
  getMyCommands,
  clearOneCommand,
  clearMyCommands,
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
router.get("/pending-count", protect, requireRole("admin"), getPendingCount);
router.patch("/:id/approve", protect, requireRole("admin"), approveDevice);
router.patch("/:id/reject", protect, requireRole("admin"), rejectDevice);

// Employee ping
router.post("/ping", protect, requireRole("employee"), pingRules, sendPing);

// Admin device management
router.get("/", protect, requireRole("admin"), getAllDevices);
router.get("/:id/history", protect, requireRole("admin"), getDeviceHistory);
router.get("/stats", protect, requireRole("admin"), getDeviceStats);
router.put(
  "/:id",
  protect,
  requireRole("admin"),
  updateDeviceRules,
  updateDevice
);
router.post(
  "/:id/command",
  protect,
  requireRole("admin"),
  commandRules,
  sendCommand
);



//command management
router.patch("/push-token", protect, requireRole("employee"), updatePushToken);
router.get("/my-commands", protect, requireRole("employee"), getMyCommands);
router.patch("/my-commands/clear-all", protect, requireRole("employee"), clearMyCommands);
router.delete("/my-commands/:commandId", protect, requireRole("employee"), clearOneCommand);


export default router;