const mongoose = require("mongoose");
const logger = require("./logger"); // not { logger } since you exported default logger

const MONGO_URI = process.env.MONGO_URI; // stick to your original env var

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("✅ MongoDB connected");
  } catch (err) {
    logger.error("❌ MongoDB connection error: " + err.message);
    process.exit(1);
  }
}

module.exports = { connectMongo, mongoose };
