# MDM System — Mobile Device Management Platform

A full-stack Mobile Device Management (MDM) system built solo, end to end — a lightweight version of what tools like Microsoft Intune or Jamf provide. It gives IT admins real-time visibility into company-used phones: live location tracking, compliance monitoring (camera/microphone/GPS permission state), and the ability to send remote commands to a specific device.

Built to solve a real gap: most MDM tools are expensive, enterprise-only, and overkill for small-to-mid companies that just need basic compliance visibility over employee-used phones.

## 🎥 Demo

*(Add your demo video link or embedded GIF here)*

## 🏗️ Architecture

Three separate applications, one backend:

```
┌─────────────────────┐         ┌─────────────────────┐
│   Admin Web (React)  │◄──────► │                     │
│   Live map, device    │         │  Backend API         │
│   management, commands│         │  (Node/Express/     │
└─────────────────────┘         │   MongoDB/Socket.io) │
                                  │                     │
┌─────────────────────┐         │                     │
│  Mobile App           │◄──────► │                     │
│  (React Native/Expo)  │         └─────────────────────┘
│  Employee telemetry    │
│  agent                │
└─────────────────────┘
```

## ✨ Core Features

### Backend
- **Access + refresh token authentication** — short-lived access tokens (15 min) with rotating, revocable refresh tokens (not a single long-lived JWT). Refresh tokens delivered via httpOnly cookie for web, request body for mobile.
- **Employee approval workflow** — employees self-register, but cannot log in until an admin approves them. Automated email notifications on approve/reject.
- **Compliance engine** — computed server-side on every GPS ping: a device is compliant only if camera access, microphone access, and GPS are all active. Every permission *change* (not every ping) is logged for a full audit history.
- **Real-time architecture** — Socket.io broadcasts live device updates to the admin dashboard, and delivers room-based targeted remote commands to a specific device.
- **Push notifications** — Firebase Cloud Messaging integration via `expo-server-sdk`, so admin commands reach a device even when the app is fully closed.
- **Security hardening** — rate limiting on auth routes, input validation (`express-validator`), centralized error handling, salted password hashing (`scrypt`), restricted CORS, database indexing and pagination for scale.

### Admin Web Dashboard (React + Tailwind)
- Live fleet overview with real-time summary cards and a compliance breakdown chart
- Searchable, paginated, filterable device management table
- Live map (Leaflet) with marker clustering, active/inactive visual states, and real-time pin updates
- Device detail view: full location + permission history (with direct Google Maps links), remote command panel, inline editing
- Pending approvals queue
- Persistent Socket.io connection (survives navigation, doesn't reconnect on every page change)
- Automatic access-token-refresh interceptor with request queuing

### Mobile App (React Native / Expo — custom EAS development build)
- Employee login, registration, and pending-approval states
- Background location tracking (`expo-task-manager` + `expo-location`), including the full Android "Allow all the time" permission UX flow
- Camera/microphone permission monitoring feeding the same compliance engine
- Real-time command listener (Socket.io) — vibration + in-app alert while open
- Push notifications for commands when the app is closed
- In-app notification history screen with clear/dismiss functionality
- Built with a custom EAS development build — not Expo Go — since background location and push notifications require native modules Expo Go doesn't support

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io, JWT, bcrypt/scrypt, Nodemailer, expo-server-sdk

**Admin Web:** React, Vite, Tailwind CSS, React Query, React Router, Leaflet, Socket.io-client, Axios

**Mobile:** React Native, Expo, EAS Build, React Navigation, expo-location, expo-task-manager, expo-notifications, expo-secure-store, Socket.io-client

## 📁 Project Structure

```
mdm-system/
├── server/          # Node.js/Express/MongoDB backend
├── admin-web/       # React admin dashboard
└── mobile-app/      # React Native employee agent
```

## 🚀 Getting Started

### Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your MongoDB URI, JWT secrets, email credentials
node src/seedAdmin.js  # creates your first admin account
npm run dev
```

### Admin Web
```bash
cd admin-web
npm install
npm run dev
```

### Mobile App
```bash
cd mobile-app
npm install
npx eas-cli login
eas build --profile development --platform android
# install the resulting APK, then:
npx expo start --dev-client
```

> **Note:** the mobile app requires a custom EAS development build, not Expo Go, since background location and push notifications depend on native modules that Expo Go doesn't include.

## 🧠 Engineering Notes & Challenges

A few of the harder problems solved along the way:

- **Cross-platform npm lockfile bug** — `package-lock.json` generated on Windows doesn't reliably capture Linux-specific optional dependency versions needed by EAS's Linux build servers, causing native/JS class mismatches. Solved by excluding the lock file from version control and letting EAS resolve dependencies fresh on its own build servers.
- **Socket.io connection stability** — early versions disconnected/reconnected on every component re-render or page navigation. Fixed by moving connection lifecycle into persistent Context providers (both web and mobile) tied to auth state, not component mount/unmount.
- **Android background execution limits** — background location tasks are subject to Doze mode and manufacturer-specific battery restrictions. Implemented an explicit permission-guidance flow (deep-linking to system Settings) since Android requires manual "Allow all the time" selection rather than a simple in-app dialog on modern versions.

## 📌 Roadmap / Known Limitations

- Not yet deployed to a public URL (currently runs locally / via local network for development and demo purposes)
- Automated test coverage is limited — testing was primarily manual via Postman during development; unit tests for the compliance engine and auth flow are a planned addition
- iOS has not yet been built/tested — development so far has focused on Android

## 📄 License

MIT

## 👤 Author

Palwasha Khan
[LinkedIn] ·   · [Email:palwashakhan.2201@mail.com]