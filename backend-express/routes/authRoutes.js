import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import db from "../models/index.js";

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Multer for file uploads
// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB total limit
  },
});

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.json({ success: false, message: "Phone required" });

  const otp = generateOtp();
  const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Store OTP in database
    await db.Otp.create({
      identifier: phone,
      type: "phone_verification",
      otp,
      expiration,
    });

    console.log("Generated OTP for phone:", otp);

    res.json({
      success: true,
      message: "OTP sent successfully (Check backend console)",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/send-email-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ success: false, message: "Email required" });

  const otp = generateOtp();
  const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    // Store OTP in database
    await db.Otp.create({
      identifier: email,
      type: "email_verification",
      otp,
      expiration,
    });

    const mailOptions = {
      from: "noreply@yourapp.com",
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP for email verification is: ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send error:", error);
        res.json({ success: false, message: "Failed to send OTP" });
      } else {
        console.log("OTP sent:", otp);
        res.json({ success: true, message: "OTP sent to your email" });
      }
    });
  } catch (error) {
    console.error("Send email OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/verify-email-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtp = await db.Otp.findOne({
      where: {
        identifier: email,
        type: "email_verification",
        otp,
      },
      order: [["id", "DESC"]],
    });

    if (!storedOtp || new Date() > storedOtp.expiration) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP verified, delete it
    await storedOtp.destroy();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const storedOtp = await db.Otp.findOne({
      where: {
        identifier: phone,
        type: "phone_verification",
        otp,
      },
      order: [["id", "DESC"]], // Get latest
    });

    if (!storedOtp || new Date() > storedOtp.expiration) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Optionally delete OTP after verification
    // await storedOtp.destroy();

    res.json({
      success: true,
      message: "OTP Verified Successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await db.AdminLogin.findOne({ where: { email } });

    if (!admin) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Direct password comparison to match existing patterns
    if (admin.password !== password) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Set httpOnly cookie with admin email
    res.cookie("adminEmail", admin.email, {
      httpOnly: true,
      secure: true, // Required for cross-site sameSite: none
      sameSite: "none", // Required for cross-site cookies (Render -> Vercel)
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({
      success: true,
      message: "Admin Login successful",
    });
  } catch (error) {
    console.error("Admin Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/admin/users", async (req, res) => {
  try {
    const users = await db.UserDetail.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.UserDetail.findOne({ where: { email } });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.password) {
      console.error("Login error: User has no password set");
      return res.json({
        success: false,
        message: "Account configuration error. Please contact support.",
      });
    }

    const isMatch = password === user.password;

    if (isMatch) {
      // Set httpOnly cookie with user email
      res.cookie("userEmail", user.email, {
        httpOnly: true,
        secure: true, // Required for cross-site sameSite: none
        sameSite: "none", // Required for cross-site cookies (Render -> Vercel)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      return res.json({
        success: true,
        message: "Login successful",
      });
    }

    res.json({
      success: false,
      message: "Invalid email or password",
    });
  } catch (error) {

    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/check-auth", (req, res) => {
  const userEmail = req.cookies.userEmail;
  if (userEmail) {
    return res.json({
      success: true,
      user: { email: userEmail },
    });
  }
  return res.json({
    success: false,
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("userEmail", {
    httpOnly: true,
    secure: false, // Match the settings used when setting the cookie
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
});

router.post("/admin/logout", (req, res) => {
  res.clearCookie("adminEmail", {
    httpOnly: true,
    secure: false, // Match the settings used when setting the cookie
    sameSite: "lax",
  });
  res.json({ success: true, message: "Admin logged out successfully" });
});

router.post("/check-user-exists", async (req, res) => {
  const { email, phone } = req.body;

  try {
    const existingUser = await db.UserDetail.findOne({
      where: {
        [db.sequelize.Sequelize.Op.or]: [{ email: email }, { phone: phone }],
      },
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
        exists: true,
      });
    }

    res.json({
      success: true,
      message: "User does not exist",
      exists: false,
    });
  } catch (error) {
    console.error("Check user exists error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/register", upload.fields([{ name: "photo", maxCount: 2 }]), async (req, res) => {
  const data = req.body;

  // Helper function to convert empty strings to null for integer fields
  const cleanIntegerField = (value) => {
    return value === "" || value === undefined
      ? null
      : parseInt(value, 10) || null;
  };

  // Helper function to convert empty strings to null for decimal fields
  const cleanDecimalField = (value) => {
    return value === "" || value === undefined
      ? null
      : parseFloat(value) || null;
  };

  try {
    // Validate photo count and size
    // Access photos via req.files.photo
    const photos = req.files?.photo || [];

    if (photos.length > 2) {
      return res.json({
        success: false,
        message: "Maximum 2 photos allowed",
      });
    }

    const totalSize = photos.reduce((sum, file) => sum + file.size, 0) || 0;
    if (totalSize > 10 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Total file size exceeds 10MB limit",
      });
    }

    // Check if user already exists
    const existingUser = await db.UserDetail.findOne({
      where: {
        [db.sequelize.Sequelize.Op.or]: [
          { email: data.email },
          { phone: data.phone },
        ],
      },
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // Create new user with cleaned data
    const hashedPassword = data.password;
    await db.UserDetail.create({
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
      otherPhone: data.otherPhone || null,
      password: hashedPassword,
      gender: data.gender || null,
      maritalStatus: data.maritalStatus || null,
      fatherName: data.fatherName || null,
      fatherOccupation: data.fatherOccupation || null,
      motherName: data.motherName || null,
      motherOccupation: data.motherOccupation || null,
      brothers: cleanIntegerField(data.brothers),
      brothersMarried: cleanIntegerField(data.brothersMarried),
      sisters: cleanIntegerField(data.sisters),
      sistersMarried: cleanIntegerField(data.sistersMarried),
      yourTemple: data.yourTemple || null,
      yourDivision: data.yourDivision || null,
      knownLanguages: data.knownLanguages || null,
      reference: data.reference || null,
      nativePlace: data.nativePlace || null,
      nativePlaceHouseName: data.nativePlaceHouseName || null,
      presentResidence: data.presentResidence || null,
      pincode: data.pincode || null,
      profileCreatedBy: data.profileCreatedBy || null,
      referredBy: data.referredBy || null,
      referralDetails1Name: data.referralDetails1Name || null,
      referralDetails1Phone: data.referralDetails1Phone || null,
      referralDetails1Address: data.referralDetails1Address || null,
      referralDetails2Name: data.referralDetails2Name || null,
      referralDetails2Phone: data.referralDetails2Phone || null,
      referralDetails2Address: data.referralDetails2Address || null,
      educationQualification: data.educationQualification || null,
      otherEducation: data.otherEducation || null,
      occupationBusiness: data.occupationBusiness || null,
      otherOccupation: data.otherOccupation || null,
      workingPlace: data.workingPlace || null,
      workDetails: data.workDetails || null,
      educationDetails: data.educationDetails || null,
      income: cleanDecimalField(data.income),
      height: data.height || null,
      complexion: data.complexion || null,
      weight: data.weight || null,
      diet: data.diet || null,
      specialCases: data.specialCases || null,
      specialCasesDetails: data.specialCasesDetails || null,
      zodiacSign: data.zodiacSign || null,
      ascendant: data.ascendant || null,
      birthStar: data.birthStar || null,
      dosham: data.dosham || null,
      placeOfBirth: data.placeOfBirth || null,
      dateOfBirth: data.dateOfBirth || null,
      timeOfBirthHours: cleanIntegerField(data.timeOfBirthHours),
      timeOfBirthMinutes: cleanIntegerField(data.timeOfBirthMinutes),
      timeOfBirthSeconds: cleanIntegerField(data.timeOfBirthSeconds),
      DasaType: data.DasaType || null,
      dasaRemainYears: cleanIntegerField(data.dasaRemainYears),
      dasaRemainMonths: cleanIntegerField(data.dasaRemainMonths),
      dasaRemainDays: cleanIntegerField(data.dasaRemainDays),
      sooriyan: cleanIntegerField(data.sooriyan),
      chandiran: cleanIntegerField(data.chandiran),
      sevai: cleanIntegerField(data.sevai),
      budhan: cleanIntegerField(data.budhan),
      viyazhan: cleanIntegerField(data.viyazhan),
      sukkiran: cleanIntegerField(data.sukkiran),
      sani: cleanIntegerField(data.sani),
      rahu: cleanIntegerField(data.rahu),
      maanthi: cleanIntegerField(data.maanthi),
      kethu: cleanIntegerField(data.kethu),
      lagnam: cleanIntegerField(data.lagnam),
      amsam_sooriyan: cleanIntegerField(data.amsam_sooriyan),
      amsam_chandiran: cleanIntegerField(data.amsam_chandiran),
      amsam_sevai: cleanIntegerField(data.amsam_sevai),
      amsam_budhan: cleanIntegerField(data.amsam_budhan),
      amsam_viyazhan: cleanIntegerField(data.amsam_viyazhan),
      amsam_sukkiran: cleanIntegerField(data.amsam_sukkiran),
      amsam_sani: cleanIntegerField(data.amsam_sani),
      amsam_rahu: cleanIntegerField(data.amsam_rahu),
      amsam_maanthi: cleanIntegerField(data.amsam_maanthi),
      amsam_kethu: cleanIntegerField(data.amsam_kethu),
      amsam_lagnam: cleanIntegerField(data.amsam_lagnam),
      fullStreetAddress: data.fullStreetAddress || null,
      city: data.city || null,
      state: data.state || null,
      district: data.district || null,
      country: data.country || null,
      postalCode: data.postalCode || null,
      whatsAppNo: data.whatsAppNo || null,
      photo: photos.length > 0 
        ? JSON.stringify(photos.map(f => f.path)) 
        : null,
      educationQualification1: data.educationQualification1 || null,
      educationDetails1: data.educationDetails1 || null,
      complexion1: data.complexion1 || null,
      personalPreference1: data.personalPreference1 || null,
      willingnessToWork1: data.willingnessToWork1 || null,
      fromAge: cleanIntegerField(data.fromAge),
      toAge: cleanIntegerField(data.toAge),
      fromHeight: data.fromHeight || null,
      toHeight: data.toHeight || null,
      occupationBusiness1: data.occupationBusiness1 || null,
      workingPlace1: data.workingPlace1 || null,
      otherEducation1: data.otherEducation1 || null,
      otherOccupation1: data.otherOccupation1 || null,
    });

    res.json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.UserDetail.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: "Email not found" });
    }

    const otp = generateOtp();
    const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.Otp.create({
      identifier: email,
      type: "password_reset",
      otp,
      expiration,
    });

    const mailOptions = {
      from: "noreply@yourapp.com",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send error:", error);
        res.json({ success: false, message: "Failed to send OTP" });
      } else {
        console.log("OTP sent:", otp);
        res.json({ success: true, message: "OTP sent to your email" });
      }
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const storedOtp = await db.Otp.findOne({
      where: {
        identifier: email,
        type: "password_reset",
        otp,
      },
      order: [["id", "DESC"]],
    });

    if (!storedOtp || new Date() > storedOtp.expiration) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP verified, delete it
    await storedOtp.destroy();

    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await db.UserDetail.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    await db.UserDetail.update({ password: newPassword }, { where: { email } });
    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
