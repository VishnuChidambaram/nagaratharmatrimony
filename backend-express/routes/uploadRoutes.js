import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinaryConfig.js";

const router = express.Router();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/upload - Upload generic files
router.post("/api/upload", upload.array("photo", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    // Map the file paths to the Cloudinary URL
    const filePaths = req.files.map(file => file.path);

    res.json({
      success: true,
      message: "Files uploaded successfully",
      paths: filePaths,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during upload",
    });
  }
});

export default router;
