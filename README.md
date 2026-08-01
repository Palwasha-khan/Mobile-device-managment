# Mobile-device-managment

server/
├── .env                          # Real secrets (gitignored, never committed)
├── .env.example                  # Placeholder values (safe to commit)
├── .gitignore
├── package.json
├── package-lock.json
│
└── src/
    ├── server.js                 # Entry point - Express + http server + Socket.io setup
    │
    ├── config/
    │   └── db.js                 # MongoDB connection logic
    │
    ├── models/
    │   ├── User.js                # Admin accounts
    │   ├── Device.js              # Employee/phone accounts + status, permissions, compliance
    │   ├── LocationLog.js         # GPS ping history
    │   ├── PermissionLog.js       # Camera/mic permission change history
    │   └── Command.js             # Remote commands sent by admin
    │
    ├── controllers/
    │   ├── authController.js      # adminLogin, employeeLogin, employeeRegister
    │   └── deviceController.js    # sendPing, getAllDevices, getDeviceHistory,
    │                               # sendCommand, approveDevice, rejectDevice, updateDevice
    │
    ├── routes/
    │   ├── authRoutes.js
    │   └── deviceRoutes.js
    │
    ├── middleware/
    │   ├── authMiddleware.js      # protect + requireRole (JWT verification)
    │   ├── errorMiddleware.js     # centralized error handler (Step 4 of our plan)
    │   └── rateLimiter.js         # login rate limiting (Step 2 of our plan)
    │
    ├── validators/
    │   ├── authValidators.js      # express-validator rules for login/register
    │   └── deviceValidators.js    # express-validator rules for ping/command
    │
    ├── utils/
    │   ├── generateToken.js       # JWT signing helper
    │   └── asyncHandler.js        # wraps controllers, removes repeated try/catch
    │
    ├── seedAdmin.js               # One-time script to create first admin
    ├── seedEmployee.js            # One-time script to create a test employee
    │
    └── tests/
        ├── complianceEngine.test.js   # Unit tests for the isCompliant logic
        └── auth.test.js                # Tests for JWT middleware (valid/invalid/missing token)
What's new compared to what you had before
validators/ — a dedicated folder (not just middleware) since these rules are meaningfully different from auth/error middleware — this is a clean separation reviewers tend to notice
middleware/errorMiddleware.js and utils/asyncHandler.js — this is the centralized error handling from Step 4, replacing repeated try/catch blocks in every controller
middleware/rateLimiter.js — isolated so it's reusable across login and register routes
tests/ — sits inside src/ (a common convention) so Jest can find it alongside the code it's testing

This structure is genuinely "professional Node.js backend" shaped — it's the kind of layout an interviewer or senior dev would recognize immediately, since it separates concerns the way most production Express apps do (routes → middleware/validation → controllers → models, with utils and config kept out of the way).

Want me to start writing these files in order — starting with config/db.js and server.js, or would you rather begin with the models since everything else depends on them existing first?
