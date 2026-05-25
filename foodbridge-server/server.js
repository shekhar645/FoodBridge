require("dotenv").config();
const express  = require("express");
const helmet   = require("helmet");
const cors     = require("cors");
const morgan   = require("morgan");
const https    = require("https");
const rateLimit = require("express-rate-limit");

const authRoutes         = require("./routes/auth");
const donationRoutes     = require("./routes/donations");
const notificationRoutes = require("./routes/notifications");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { startCron } = require("./cron");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)       || 100,
  message:  { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts. Please wait 15 minutes." },
});

app.use(limiter);

// ─── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FoodBridge API is running 🚀",
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth",          authLimiter, authRoutes);
app.use("/api/donations",     donationRoutes);
app.use("/api/notifications", notificationRoutes);

// ─── Error handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FoodBridge server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
});

startCron();

// ─── Keep alive (Render free tier) ────────────────────────────
setInterval(() => {
  https.get("https://foodbridge-server.onrender.com/api/health", (res) => {
    console.log("Keep-alive ping sent ✅");
  }).on("error", (err) => {
    console.log("Ping error:", err.message);
  });
}, 10 * 60 * 1000);

module.exports = app;