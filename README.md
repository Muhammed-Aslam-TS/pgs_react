# Liquid Park — Backend API Server

Node.js / Express backend for the Amex Parking Management System.

## 🚀 Getting Started

```bash
npm install
npm start        # runs with nodemon (auto-restart on changes)
```

Server starts on **http://localhost:8000**

---

## 📁 Project Structure

```
Aslam_Liquid_park/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── admin.js               # Username/password auth (Admin model)
│   ├── authController.js      # Email/password auth  (User model)
│   ├── command.js             # UDP hardware commands
│   ├── displays.js
│   ├── floors.js
│   ├── parkings.js
│   ├── reports.js
│   ├── spaces.js
│   └── zones.js
├── middleware/
│   ├── authMiddleware.js      # JWT protect (User model - email auth)
│   ├── check-role.js          # Role-based access control
│   ├── errorMiddleware.js     # Global error handler
│   └── is-auth.js             # JWT protect (Admin model - username auth)
├── models/
│   ├── Admin.js               # Admin user (username + role)
│   ├── User.js                # General user (email + role)
│   ├── Displays.js
│   ├── Floors.js
│   ├── ParkingReports.js
│   ├── Parkings.js
│   ├── SpaceEvents.js
│   ├── Spaces.js
│   └── Zones.js
├── routes/
│   ├── api.js                 # Main API routes (protected with isAuth)
│   └── authRoutes.js          # Email-based auth routes
├── socket.js                  # Socket.io initializer
├── udp.js                     # UDP server (legacy)
├── udp1.js                    # UDP server (active)
├── app.js                     # Express app entry point
├── .env                       # Environment variables (never commit)
└── package.json
```

---

## 🔐 Authentication

Two auth systems are active:

| Route | Method | Description |
|-------|--------|-------------|
| `POST /api/register` | Public | Register admin (username + password) |
| `POST /api/login` | Public | Login admin → returns JWT |
| `POST /api/auth/register` | Public | Register user (email + password) |
| `POST /api/auth/login` | Public | Login user → returns JWT |
| `GET /api/auth/me` | Protected | Get logged-in user info |

### Using the token
Send in every protected request header:
```
Authorization: Bearer <your_token>
```

---

## 🌐 Environment Variables (`.env`)

```
JWT_SECRET=SECRET
MONGODB_URI=mongodb://localhost:27017/amex_config
NODE_ENV=development
```

---

## 📡 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `dashboard` | bi-directional | Parking dashboard data |
| `display` | bi-directional | Display board updates |
| `graph` | server → client | Real-time occupancy graph |
# pgs_react
