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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:3000",
  "http://169.254.156.216:3000",
  "http://192.168.1.2:3000",
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(",").map(url => url.trim().replace(/\/$/, ""));
  allowedOrigins.push(...envOrigins);
}

console.log("CORS Configuration: Allowed Origins ->", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}. Expected one of: ${allowedOrigins.join(", ")}`);
        // Instead of returning an error which might stop header processing, 
        // we just return false to let the browser handle the block normally.
        return callback(null, false);
      }
    },
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Middleware to set Content-Disposition for uploads to display inline
app.use("/uploads", (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");
  next();
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", updateRequestRoutes);
app.use("/", notificationRoutes);
app.use("/", uploadRoutes);

async function initDB() {
  try {
    await db.sequelize.authenticate();
    console.log("Connected to MySQL database");

    // Sync the model with the database
    // Removed { alter: true } to prevent TiDB unique constraint errors on restart
    // If you need to update schema, do it manually or use migrations
    await db.sequelize.sync();

    // Insert sample data if table is empty
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

await initDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Cookie parser middleware initialized");
});
