import express from "express";
import { adminLogin, employeeRegister, employeeLogin, refreshToken, logout, createNewAdmin } from "../controllers/authController.js";
import { adminLoginRules, employeeRegisterRules, employeeLoginRules } from "../validators/authValidators.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", authLimiter, adminLoginRules, adminLogin);
router.post("/employee-register", authLimiter, employeeRegisterRules, employeeRegister);
router.post("/employee-login", authLimiter, employeeLoginRules, employeeLogin);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/create-admin", authLimiter, adminLoginRules, createNewAdmin); // For initial setup only

export default router;