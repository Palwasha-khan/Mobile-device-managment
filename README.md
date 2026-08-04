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
 


Phase	Status
1. Secrets/env locked down	✅ Done
2. CORS + rate limiting	✅ Done (restricted CORS, authLimiter on login/register)
3. Input validation	✅ Done (express-validator on all auth routes)
4. Centralized error handling	✅ Done (asyncHandler + errorMiddleware)
5. Database efficiency (indexes, pagination, lean queries)	✅ Done
6.postman testing ✅ Done
7. Basic logging	✅ Done (morgan)
8. Deploy to a live URL	❌ Not done

--Features-- 

❌ LocationLog model + GPS ping endpoint
❌ PermissionLog model + camera/mic permission tracking
❌ The actual compliance engine (isCompliant calculation)
❌ GET /api/device (list all devices for the dashboard)
❌ Socket.io (live map updates, real-time command delivery)
❌ Command model + remote command system
❌ Device detail/history endpoints
✅ Employee registration + admin approval (new — this is actually beyond the original plan)
✅ Admin edit rights — you mentioned wanting this, but we haven't built the edit endpoint yet either


admin-web/
├── .env                          # VITE_API_URL=http://localhost:5000/api
├── .gitignore
├── package.json
│
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    │
    ├── api/
    │   ├── axiosClient.js         # Phase 1 - the refresh-interceptor axios instance
    │   ├── socket.js               # Phase 7
    │   └── endpoints/
    │       ├── authApi.js          # login, logout, refresh
    │       └── deviceApi.js        # getDevices, getDeviceHistory, approve, reject, sendCommand, updateDevice, promoteToAdmin
    │
    ├── context/
    │   ├── AuthContext.jsx         # Phase 2
    │   └── SocketContext.jsx       # Phase 7
    │
    ├── hooks/
    │   ├── useDevices.js           # React Query wrapper around deviceApi
    │   ├── useDeviceHistory.js
    │   ├── usePendingDevices.js
    │   └── useSocketEvent.js
    │
    ├── routes/
    │   ├── AppRoutes.jsx
    │   └── ProtectedRoute.jsx      # Phase 2
    │
    ├── layouts/
    │   ├── DashboardLayout.jsx     # Phase 3
    │   └── AuthLayout.jsx
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.jsx
    │   │   ├── Badge.jsx
    │   │   ├── Card.jsx
    │   │   ├── Table.jsx
    │   │   ├── Input.jsx
    │   │   ├── Spinner.jsx
    │   │   └── Skeleton.jsx        # Phase 8
    │   ├── layout/
    │   │   ├── Sidebar.jsx         # Phase 3
    │   │   └── Topbar.jsx          # Phase 3
    │   └── shared/
    │       ├── ComplianceBadge.jsx
    │       ├── ConfirmDialog.jsx
    │       ├── EmptyState.jsx      # Phase 8
    │       └── ErrorBoundary.jsx
    │
    ├── features/
    │   ├── auth/
    │   │   └── LoginPage.jsx       # Phase 2
    │   │
    │   ├── dashboard/
    │   │   ├── DashboardPage.jsx   # Phase 4
    │   │   └── components/
    │   │       ├── SummaryCards.jsx
    │   │       └── ComplianceChart.jsx
    │   │
    │   ├── devices/
    │   │   ├── DevicesListPage.jsx      # Phase 5
    │   │   ├── DeviceDetailPage.jsx     # Phase 5
    │   │   └── components/
    │   │       ├── DeviceTable.jsx
    │   │       ├── DeviceFilters.jsx
    │   │       ├── LocationHistoryTab.jsx
    │   │       ├── PermissionHistoryTab.jsx
    │   │       ├── EditDeviceForm.jsx
    │   │       ├── CommandPanel.jsx
    │   │       └── PromoteToAdminButton.jsx
    │   │
    │   ├── pendingApprovals/
    │   │   ├── PendingApprovalsPage.jsx # Phase 6
    │   │   └── components/
    │   │       └── PendingRow.jsx
    │   │
    │   ├── map/
    │   │   ├── LiveMapPage.jsx     # Phase 7
    │   │   └── components/
    │   │       └── DeviceMap.jsx
    │   │
    │   └── settings/
    │       ├── SettingsPage.jsx
    │       └── components/
    │           └── ChangePasswordForm.jsx
    │
    └── utils/
        ├── formatDate.js
        └── constants.js            # command types, colors, etc.


        1
Phase 1:✅ Project setup + the axios refresh interceptor
Scaffold with Vite, install core dependencies (react-router-dom, axios, @tanstack/react-query, socket.io-client), set up the folder structure, and build the axios instance with an interceptor that automatically refreshes the access token on a 401 and retries the failed request once. This is the piece that makes the whole access+refresh token system actually work seamlessly in the UI.
2
Phase 2:✅ Auth - login, context, protected routes
Build AuthContext (login, logout, current admin state), the Login page, and ProtectedRoute. Test that login works, the access token attaches to requests, and refresh-on-expiry actually happens (you can fake this by temporarily setting ACCESS_TOKEN_EXPIRES_IN to something very short like 30s on the backend to watch it refresh live).
3
Phase 3:✅ Dashboard layout shell (sidebar + topbar)
Build the persistent shell every authenticated page lives inside: Sidebar (nav links), Topbar (admin name, logout), and DashboardLayout wrapping them. Get routing fully wired so navigating between pages doesn't lose the sidebar/topbar.
4
Phase 4:✅ Dashboard home page (summary cards + chart)
Build the actual dashboard home page: summary cards (Total Devices, Active, Compliant, Non-Compliant), and a compliance breakdown chart. This is largely a GET /api/device request summarized client-side, or you can add a small /api/device/stats backend route later if you want the counting done server-side instead.
5
Phase 5:✅ Devices list + device detail/edit/commands
Build the devices table using the paginated GET /api/device endpoint from Phase 5 of the backend plan - search, sort, pagination controls, compliance badges. Then the device detail page: location history table, permission history table, edit form (PUT /api/device/:id), and the 3 remote command buttons.
6
Phase 6: ✅Pending approvals page (new - didn't exist before)
Build the Pending Approvals page - GET /api/device/pending, with Approve/Reject buttons per row. This is a feature your backend already supports but admin-web has never had a UI for yet.
7
Phase 7:✅ Live map + persistent Socket.io connection
Build the Leaflet map (reusing the DeviceMap logic from before) as its own full page, plus wire up socket.io-client with a SocketContext so the connection persists across navigation instead of disconnecting every time you switch pages (the bug you fixed on mobile applies here too).
8
Phase 8:✅ Polish (loading states, empty states, visual design)
Polish pass: loading skeletons instead of blank text, empty states, consistent error toasts (react-hot-toast), and a visual design pass using the frontend-design principles instead of raw inline styles.