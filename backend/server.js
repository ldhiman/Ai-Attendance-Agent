const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDatabase = require("./config/database");

const employeeRoutes = require("./routes/employees");

const locationRoutes = require("./routes/locations");

const attendanceRoutes = require("./routes/attendance");

const callRoutes = require("./routes/calls");

const hunarWebhookRoutes = require("./routes/hunarWebhook");

const app = express();

// ==========================================
// DATABASE
// ==========================================

connectDatabase().catch(console.error);

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  }),
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(
  express.json({
    verify: (req, res, buffer) => {
      req.rawBody = Buffer.from(buffer);
    },
  }),
);

// ==========================================
// ROUTES
// ==========================================

app.use("/api/employees", employeeRoutes);

app.use("/api/locations", locationRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/calls", callRoutes);

app.use("/api/webhooks/hunar", hunarWebhookRoutes);

// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Attendance API is running",
  });
});

// ==========================================
// HEALTH
// ==========================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,

    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ==========================================
// 404
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,

    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// LOCAL SERVER
// ==========================================

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
