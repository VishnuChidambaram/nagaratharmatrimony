import express from "express";
import multer from "multer";
import { storage } from "../config/cloudinaryConfig.js";

const router = express.Router();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only .jpg and .jpeg files are allowed!"));
    }
  }
});

// POST /api/upload - Upload generic files
router.post("/api/upload", (req, res, next) => {
  upload.array("photo", 5)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, (req, res) => {
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
