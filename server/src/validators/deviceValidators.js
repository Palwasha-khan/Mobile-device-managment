import { body, validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const pingRules = [
  body("lat").isFloat().withMessage("lat must be a number"),
  body("lng").isFloat().withMessage("lng must be a number"),
  body("cameraPermission")
    .optional()
    .isIn(["granted", "denied"])
    .withMessage("cameraPermission must be 'granted' or 'denied'"),
  body("microphonePermission")
    .optional()
    .isIn(["granted", "denied"])
    .withMessage("microphonePermission must be 'granted' or 'denied'"),
  validate,
];

export const commandRules = [
  body("commandType")
    .isIn(["ring_alert", "lock_warning", "compliance_warning"])
    .withMessage("Invalid command type"),
  validate,
];

export const updateDeviceRules = [
  body("employeeName").optional().trim().notEmpty(),
  body("email").optional().isEmail(),
  body("deviceId").optional().trim().notEmpty(),
  validate,
];