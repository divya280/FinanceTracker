require("dotenv").config();

const express = require("express");
const http = require("http");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const mongoose = require("mongoose");
const { connectMongo } = require("./config/db");   // 👈 using db.js
const v1Router = require("./src/index");          // 👈 entry point inside src

const app = express();

// Parse JSON body
app.use(express.json());

// CORS setup
const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

// Rate limiting (disabled in dev)
if (process.env.NODE_ENV !== "development") {
  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
    max: Number(process.env.RATE_LIMIT_MAX) || 100, // 100 requests
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// Health routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Personal Finance Tracker API" });
});

app.get("/finance", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Versioned routes
app.use("/api/v1", v1Router);
// Existing middleware and routes here...

// Error handling middleware for invalid JSON, etc.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON payload", error: err.message });
  }
  next(err);
});

// You can add a generic catch-all error handler next
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong!' });
});


const PORT = process.env.PORT || 3000;

// Start server (only when running locally, not in serverless)
async function startServer() {
  try {
    await connectMongo();
    console.log(" MongoDB Connected:", mongoose.connection.readyState === 1);

    http.createServer(app).listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Only start server if not in serverless environment
if (require.main === module) {
  startServer();
}

// Export app for serverless deployment
module.exports = app;
