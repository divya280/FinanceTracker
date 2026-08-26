const mongoose = require("mongoose");
const dns = require("dns");
const logger = require("./logger").default; // Access .default for ES6 export default

// Some local/VPN networks hand out DNS servers that refuse SRV queries,
// which breaks mongodb+srv:// lookups. Force a public resolver for this process.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const MONGO_URI = process.env.MONGO_URI; // stick to your original env var

// Cache the connection promise for serverless environments
let cachedConnection = null;

async function connectMongo() {
  // If already connected, reuse the connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info("♻️ Reusing existing MongoDB connection");
    return cachedConnection;
  }

  try {
    // Optimize for serverless with connection pooling
    const options = {
      maxPoolSize: 10, // Limit connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    cachedConnection = await mongoose.connect(MONGO_URI, options);
    logger.info("✅ MongoDB connected");
    return cachedConnection;
  } catch (err) {
    logger.error("❌ MongoDB connection error: " + err.message);
    // In serverless, don't exit process - just throw error
    if (process.env.VERCEL) {
      throw err;
    }
    process.exit(1);
  }
}

module.exports = { connectMongo, mongoose };
