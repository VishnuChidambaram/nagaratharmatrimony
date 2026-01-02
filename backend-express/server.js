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
import db from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import updateRequestRoutes from "./routes/updateRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import migrationRoutes from "./routes/migrationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cookieParser());
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

console.log("CORS Configuration: Allowed Origins ->", allowedOrigins);

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
  console.log(`[${timestamp}] Health check hit`);
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
app.use("/", migrationRoutes);

async function initDB(retries = 5) {
  while (retries > 0) {
    try {
      console.log(`Attempting database connection... (Retries left: ${retries})`);
      console.log(`DB Host: ${process.env.DB_HOST}, User: ${process.env.DB_USER}, Database: ${process.env.DB_NAME}`);
      
      await db.sequelize.authenticate();
      console.log("Connected to MySQL database successfully");

      // Sync the model with the database
      await db.sequelize.sync({ alter: true });
      return; // Success
    } catch (error) {
      console.error("Database connection attempt failed:", error.message);
      retries -= 1;
      if (retries === 0) {
        console.error("Max retries reached. Database connection failed.");
        // We don't throw here to allow the server to keep running, 
        // but it will be in a "broken" state for DB-dependent routes.
        return;
      }
      console.log("Waiting 5 seconds before next attempt...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server is listening on 0.0.0.0:${PORT}`);
  console.log("Cookie parser middleware initialized");
  
  // Initialize DB after server starts listening
  try {
    await initDB();
  } catch (err) {
    console.error("Critical error during database initialization:", err);
  }
});

