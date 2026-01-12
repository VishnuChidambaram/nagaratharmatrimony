import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import db from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import updateRequestRoutes from "./routes/updateRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import morgan from "morgan";
import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid breaking existing functionality
  crossOriginEmbedderPolicy: false,
}));

app.use(cookieParser());

import { authLimiter, registrationLimiter } from "./middleware/rateLimiter.js";


const allowedOrigins = [
  "http://localhost:3000",
  "http://169.254.156.216:3000",
  "http://192.168.1.2:3000",
  "https://nagaratharmatrimony.vercel.app", // Explicitly adding this to be safe
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(",").map(url => url.trim().replace(/\/$/, ""));
  envOrigins.forEach(o => {
    if (!allowedOrigins.includes(o)) allowedOrigins.push(o);
  });
}


app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

logger.info(`CORS Configuration: Allowed Origins -> ${JSON.stringify(allowedOrigins)}`);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`CORS Request - Origin: ${origin}`);
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        console.log(`CORS Allowed: ${normalizedOrigin}`);
        return callback(null, true);
      } else {
        console.warn(`CORS Blocked: Origin ${origin} (Normalized: ${normalizedOrigin}) not in ${JSON.stringify(allowedOrigins)}`);
        return callback(null, false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check route for Render/monitoring - moved earlier for faster availability
app.get("/api/health", (req, res) => {
  const timestamp = new Date().toISOString();
  logger.info(`Health check hit`);
  res.status(200).json({ 
    status: "ok", 
    timestamp,
    uptime: process.uptime(),
    dbStatus: db.sequelize ? "initialized" : "not_initialized",
    env: process.env.NODE_ENV || "development"
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Nagarathar Matrimony Backend is running.");
});

// Middleware to set Content-Disposition for uploads to display inline
app.use("/uploads", (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");
  next();
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


import { sessionAuthMiddleware } from "./middleware/authMiddleware.js";

// Routes
// Apply Middleware to extract user info from Headers/Cookies
app.use(sessionAuthMiddleware);

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", updateRequestRoutes);
app.use("/", notificationRoutes);
app.use("/", uploadRoutes);

// Error handling middleware (must be after all routes)
app.use(errorHandler);

async function initDB(retries = 5) {
  while (retries > 0) {
    try {
      logger.info(`Attempting database connection... (Retries left: ${retries})`);
      logger.debug(`DB Host: ${process.env.DB_HOST}, User: ${process.env.DB_USER}, Database: ${process.env.DB_NAME}`);
      
      await db.sequelize.authenticate();
      logger.info("Connected to MySQL database successfully");

      // Sync the model with the database
      // alter: true removed to prevent startup crashes on production
      await db.sequelize.sync(); 
      return; // Success
    } catch (error) {
      logger.error(`Database connection attempt failed: ${error.message}`);
      retries -= 1;
      if (retries === 0) {
        logger.error("Max retries reached. Database connection failed.");
        // We don't throw here to allow the server to keep running, 
        // but it will be in a "broken" state for DB-dependent routes.
        return;
      }
      logger.info("Waiting 5 seconds before next attempt...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

const PORT = process.env.PORT || 5000;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, "0.0.0.0", async () => {
    logger.info(`Server is listening on 0.0.0.0:${PORT}`);
    logger.info("Cookie parser middleware initialized");
    
    // Initialize DB after server starts listening
    try {
      await initDB();
    } catch (err) {
      logger.error(`Critical error during database initialization: ${err.message}`);
    }
  });
}

export { app, authLimiter, registrationLimiter };

