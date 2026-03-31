const express    = require("express");
const bodyParser = require("body-parser");
const cors       = require("cors");
require("dotenv").config();

const connectDB        = require("./config/db");
const apiRoutes        = require("./routes/api");
const authRoutes       = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");
const udp1             = require("./udp1");
const commandUdp       = require("./controllers/command");

// ─────────────────────────────────────────────
//  App setup
// ─────────────────────────────────────────────
const app = express();

// CORS — allow React dev servers
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true,
}));

// Body parsing
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

// ─────────────────────────────────────────────
//  Routes
// ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);  // email-based auth  (User model)
app.use("/api",      apiRoutes);   // username-based auth + all other APIs

// Global error handler (must be last)
app.use(errorHandler);

// ─────────────────────────────────────────────
//  Start server after DB connects
// ─────────────────────────────────────────────
connectDB().then(() => {
  // Start UDP listeners
  udp1();
  commandUdp.startCommandUdp();

  const server = app.listen(8000, () => {
    console.log("🚀 HTTP server running on port 8000");
  });

  // Socket.io setup
  const io = require("./socket").init(server);
  exports.io = io;

  io.on("connection", (socket) => {
    console.log("🔌 Client connected");

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });

    socket.on("dashboard", (msg) => {
      io.emit("dashboard", msg);
    });

    socket.on("display", (msg) => {
      io.emit("display", msg);
    });
  });
});
