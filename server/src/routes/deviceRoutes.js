import express from "express";
import { getPendingDevices, approveDevice, rejectDevice } from "../controllers/deviceController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/pending", protect, requireRole("admin"), getPendingDevices);
router.patch("/:id/approve", protect, requireRole("admin"), approveDevice);
router.patch("/:id/reject", protect, requireRole("admin"), rejectDevice);

export default router;