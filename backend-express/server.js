import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import bcrypt from "bcrypt";
import db from "./models/index.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import updateRequestRoutes from "./routes/updateRequestRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://169.254.156.216:3000", "http://192.168.1.2:3000"],
    credentials: true,
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
    await db.sequelize.sync({ alter: true });

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
});
