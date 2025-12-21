import express from "express";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import db from "../models/index.js";

const router = express.Router();

// Configure multer for file uploads
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

const upload = multer({ storage: storage });

router.get("/upload-details", async (req, res) => {
  try {
    const { email } = req.query; // Get email from query params
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    // Find all details for the user
    const uploadDetails = await db.UserDetail.findAll({
      where: { email },
    });
    res.json({
      success: true,
      data: uploadDetails,
    });
  } catch (error) {
    console.error("Fetch upload details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/all-details", async (req, res) => {
  try {
    // Fetch ALL details from the database without any filter
    const allDetails = await db.UserDetail.findAll({
      where: { is_deleted: false }, // Only fetch non-deleted users
      order: [["created_at", "DESC"]], // Order by newest first
    });
    res.json({
      success: true,
      data: allDetails,
      count: allDetails.length,
    });
  } catch (error) {
    console.error("Fetch all details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/userdetails/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const userDetail = await db.UserDetail.findOne({ where: { email } });
    if (!userDetail) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Convert userDetail to plain object so we can modify it
    const userData = userDetail.toJSON();
    
    // Parse photo field (which is stored as JSON string) into photos array
    if (userData.photo) {
      try {
        const parsedPhotos = JSON.parse(userData.photo);
        userData.photos = Array.isArray(parsedPhotos) ? parsedPhotos : [userData.photo];
      } catch (e) {
        // If parsing fails, treat as single photo path
        userData.photos = [userData.photo];
      }
    } else {
      userData.photos = [];
    }
    
    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Fetch user detail error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/upload-details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query; // Get email from query params for ownership check
    const uploadDetail = await db.UserDetail.findByPk(id);
    if (!uploadDetail) {
      return res.status(404).json({
        success: false,
        message: "Detail not found",
      });
    }
    // Check if the detail belongs to the requesting user
    if (email && uploadDetail.email !== email) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You do not own this detail",
      });
    }
    res.json({
      success: true,
      data: uploadDetail,
    });
  } catch (error) {
    console.error("Fetch single upload detail error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post(
  "/upload-details",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  async (req, res) => {
    const { name, phoneNumber, description, email } = req.body;

    try {
      // Check if email already exists
      const existingEmail = await db.UserDetail.findOne({
        where: { email },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Check if phoneNumber already exists
      const existingPhone = await db.UserDetail.findOne({
        where: { phoneNumber },
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }

      // Get file paths if files were uploaded
      // Fix: Store photo in 'photo' field as a JSON stringified array to match model and frontend expectations
      let photoPath = null;
      if (req.files.image) {
        photoPath = JSON.stringify(["uploads/" + req.files.image[0].filename]);
      }
      
      const pdfPath = req.files.pdf
        ? "uploads/" + req.files.pdf[0].filename
        : null;

      // Create new user detail entry
      const userDetail = await db.UserDetail.create({
        name,
        email,
        password: "defaultpass", // You might want to generate a random password or ask for it
        phoneNumber,
        description,
        photo: photoPath, // Changed from imagePath to photo
        pdfPath,
      });

      res.json({
        success: true,
        message: "",
        data: userDetail,
      });
    } catch (error) {
      console.error("Upload details error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

router.put(
  "/upload-details/:email",
  upload.fields([{ name: "photo", maxCount: 5 }]),
  async (req, res) => {
    const { email } = req.params;
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
      // Find the existing detail by email
      const existingDetail = await db.UserDetail.findOne({
        where: { email: email },
      });
      if (!existingDetail) {
        return res.status(404).json({
          success: false,
          message: "Detail not found",
        });
      }

      // Check if new email is unique (excluding current record)
      if (data.email && data.email !== existingDetail.email) {
        const existingEmail = await db.UserDetail.findOne({
          where: { email: data.email },
        });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }
      }

      // Check if phone is unique (excluding current record)
      if (data.phone && data.phone !== existingDetail.phone) {
        const existingPhone = await db.UserDetail.findOne({
          where: { phone: data.phone },
        });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: "Phone number already exists",
          });
        }
      }

      // Handle Photo Logic (Append or Reorder)
      let updatedPhotoList = null;
      
      // Case 1: New photo(s) uploaded -> Append to existing list
      if (req.files && req.files.photo) {
        let currentPhotos = [];
        try {
          if (existingDetail.photo) {
            currentPhotos = JSON.parse(existingDetail.photo);
            if (!Array.isArray(currentPhotos)) currentPhotos = [existingDetail.photo];
          }
        } catch (e) {
          // If parsing fails, assume it's a single string path
           if (existingDetail.photo) currentPhotos = [existingDetail.photo];
        }

        // Process all uploaded photos (not just the first one)
        req.files.photo.forEach(file => {
          const newPhotoPath = "uploads/" + file.filename;
          currentPhotos.push(newPhotoPath);
        });
        
        // Limit to 5 photos (keep latest 5)
        if (currentPhotos.length > 5) {
             currentPhotos = currentPhotos.slice(-5);
        }
        updatedPhotoList = JSON.stringify(currentPhotos);
      } 
      // Case 2: No new file, but 'photo' body param exists -> Reordering or explicit update
      else if (data.photo !== undefined) {
         // Expecting data.photo to be a JSON string of array of paths
         updatedPhotoList = data.photo;
      }

      // Prepare update data - only include fields that are provided
      const updateData = {};

      // Basic Details
      if (data.name !== undefined) updateData.name = data.name || null;
      if (data.email !== undefined) updateData.email = data.email || null;
      if (data.phone !== undefined) updateData.phone = data.phone || null;
      if (data.otherPhone !== undefined) updateData.otherPhone = data.otherPhone || null;
      if (data.password !== undefined) {
        updateData.password = data.password;
      }
      if (data.photoPassword !== undefined) {
        updateData.photoPassword = data.photoPassword;
      }

      if (data.gender !== undefined) updateData.gender = data.gender || null;
      if (data.maritalStatus !== undefined)
        updateData.maritalStatus = data.maritalStatus || null;
      if (data.fatherName !== undefined)
        updateData.fatherName = data.fatherName || null;
      if (data.fatherOccupation !== undefined)
        updateData.fatherOccupation = data.fatherOccupation || null;
      if (data.motherName !== undefined)
        updateData.motherName = data.motherName || null;
      if (data.motherOccupation !== undefined)
        updateData.motherOccupation = data.motherOccupation || null;
      if (data.brothers !== undefined)
        updateData.brothers = cleanIntegerField(data.brothers);
      if (data.brothersMarried !== undefined)
        updateData.brothersMarried = cleanIntegerField(data.brothersMarried);
      if (data.sisters !== undefined)
        updateData.sisters = cleanIntegerField(data.sisters);
      if (data.sistersMarried !== undefined)
        updateData.sistersMarried = cleanIntegerField(data.sistersMarried);
      if (data.yourTemple !== undefined)
        updateData.yourTemple = data.yourTemple || null;
      if (data.yourDivision !== undefined)
        updateData.yourDivision = data.yourDivision || null;
      if (data.knownLanguages !== undefined)
        updateData.knownLanguages = data.knownLanguages || null;
      if (data.reference !== undefined)
        updateData.reference = data.reference || null;
      if (data.nativePlace !== undefined)
        updateData.nativePlace = data.nativePlace || null;
      if (data.nativePlaceHouseName !== undefined)
        updateData.nativePlaceHouseName = data.nativePlaceHouseName || null;
      if (data.presentResidence !== undefined)
        updateData.presentResidence = data.presentResidence || null;
      if (data.pincode !== undefined) updateData.pincode = data.pincode || null;
      if (data.profileCreatedBy !== undefined)
        updateData.profileCreatedBy = data.profileCreatedBy || null;
      if (data.referredBy !== undefined)
        updateData.referredBy = data.referredBy || null;
      if (data.referralDetails1Name !== undefined)
        updateData.referralDetails1Name = data.referralDetails1Name || null;
      if (data.referralDetails1Phone !== undefined)
        updateData.referralDetails1Phone = data.referralDetails1Phone || null;
      if (data.referralDetails1Address !== undefined)
        updateData.referralDetails1Address =
          data.referralDetails1Address || null;
      if (data.referralDetails2Name !== undefined)
        updateData.referralDetails2Name = data.referralDetails2Name || null;
      if (data.referralDetails2Phone !== undefined)
        updateData.referralDetails2Phone = data.referralDetails2Phone || null;
      if (data.referralDetails2Address !== undefined)
        updateData.referralDetails2Address =
          data.referralDetails2Address || null;

      // Education & Occupation
      if (data.educationQualification !== undefined)
        updateData.educationQualification = data.educationQualification || null;
      if (data.otherEducation !== undefined)
        updateData.otherEducation = data.otherEducation || null;
      if (data.occupationBusiness !== undefined)
        updateData.occupationBusiness = data.occupationBusiness || null;
      if (data.otherOccupation !== undefined)
        updateData.otherOccupation = data.otherOccupation || null;
      if (data.workingPlace !== undefined)
        updateData.workingPlace = data.workingPlace || null;
      if (data.workDetails !== undefined)
        updateData.workDetails = data.workDetails || null;
      if (data.educationDetails !== undefined)
        updateData.educationDetails = data.educationDetails || null;
      if (data.incomeType !== undefined)
        updateData.incomeType = data.incomeType || null;
      if (data.income !== undefined)
        updateData.income = cleanDecimalField(data.income);

      // Physical Attributes
      if (data.height !== undefined) updateData.height = data.height || null;
      if (data.complexion !== undefined)
        updateData.complexion = data.complexion || null;
      if (data.weight !== undefined) updateData.weight = data.weight || null;
      if (data.diet !== undefined) updateData.diet = data.diet || null;
      if (data.specialCases !== undefined)
        updateData.specialCases = data.specialCases || null;
      if (data.specialCasesDetails !== undefined)
        updateData.specialCasesDetails = data.specialCasesDetails || null;

      // Astrology Basic Details
      if (data.zodiacSign !== undefined)
        updateData.zodiacSign = data.zodiacSign || null;
      if (data.ascendant !== undefined)
        updateData.ascendant = data.ascendant || null;
      if (data.birthStar !== undefined)
        updateData.birthStar = data.birthStar || null;
      if (data.dosham !== undefined) updateData.dosham = data.dosham || null;
      if (data.placeOfBirth !== undefined)
        updateData.placeOfBirth = data.placeOfBirth || null;
      if (data.dateOfBirth !== undefined)
        updateData.dateOfBirth = data.dateOfBirth || null;
      if (data.timeOfBirthHours !== undefined)
        updateData.timeOfBirthHours = cleanIntegerField(data.timeOfBirthHours);
      if (data.timeOfBirthMinutes !== undefined)
        updateData.timeOfBirthMinutes = cleanIntegerField(
          data.timeOfBirthMinutes
        );
      if (data.timeOfBirthSeconds !== undefined)
        updateData.timeOfBirthSeconds = cleanIntegerField(
          data.timeOfBirthSeconds
        );
      if (data.DasaType !== undefined)
        updateData.DasaType = data.DasaType || null;
      if (data.dasaRemainYears !== undefined)
        updateData.dasaRemainYears = cleanIntegerField(data.dasaRemainYears);
      if (data.dasaRemainMonths !== undefined)
        updateData.dasaRemainMonths = cleanIntegerField(data.dasaRemainMonths);
      if (data.dasaRemainDays !== undefined)
        updateData.dasaRemainDays = cleanIntegerField(data.dasaRemainDays);

      // Full Horoscope Chart
      if (data.sooriyan !== undefined)
        updateData.sooriyan = cleanIntegerField(data.sooriyan);
      if (data.chandiran !== undefined)
        updateData.chandiran = cleanIntegerField(data.chandiran);
      if (data.sevai !== undefined)
        updateData.sevai = cleanIntegerField(data.sevai);
      if (data.budhan !== undefined)
        updateData.budhan = cleanIntegerField(data.budhan);
      if (data.viyazhan !== undefined)
        updateData.viyazhan = cleanIntegerField(data.viyazhan);
      if (data.sukkiran !== undefined)
        updateData.sukkiran = cleanIntegerField(data.sukkiran);
      if (data.sani !== undefined)
        updateData.sani = cleanIntegerField(data.sani);
      if (data.rahu !== undefined)
        updateData.rahu = cleanIntegerField(data.rahu);
      if (data.maanthi !== undefined)
        updateData.maanthi = cleanIntegerField(data.maanthi);
      if (data.kethu !== undefined)
        updateData.kethu = cleanIntegerField(data.kethu);
      if (data.lagnam !== undefined)
        updateData.lagnam = cleanIntegerField(data.lagnam);
      if (data.amsam_sooriyan !== undefined)
        updateData.amsam_sooriyan = cleanIntegerField(data.amsam_sooriyan);
      if (data.amsam_chandiran !== undefined)
        updateData.amsam_chandiran = cleanIntegerField(data.amsam_chandiran);
      if (data.amsam_sevai !== undefined)
        updateData.amsam_sevai = cleanIntegerField(data.amsam_sevai);
      if (data.amsam_budhan !== undefined)
        updateData.amsam_budhan = cleanIntegerField(data.amsam_budhan);
      if (data.amsam_viyazhan !== undefined)
        updateData.amsam_viyazhan = cleanIntegerField(data.amsam_viyazhan);
      if (data.amsam_sukkiran !== undefined)
        updateData.amsam_sukkiran = cleanIntegerField(data.amsam_sukkiran);
      if (data.amsam_sani !== undefined)
        updateData.amsam_sani = cleanIntegerField(data.amsam_sani);
      if (data.amsam_rahu !== undefined)
        updateData.amsam_rahu = cleanIntegerField(data.amsam_rahu);
      if (data.amsam_maanthi !== undefined)
        updateData.amsam_maanthi = cleanIntegerField(data.amsam_maanthi);
      if (data.amsam_kethu !== undefined)
        updateData.amsam_kethu = cleanIntegerField(data.amsam_kethu);
      if (data.amsam_lagnam !== undefined)
        updateData.amsam_lagnam = cleanIntegerField(data.amsam_lagnam);

      // Contact Details
      if (data.fullStreetAddress !== undefined)
        updateData.fullStreetAddress = data.fullStreetAddress || null;
      if (data.city !== undefined) updateData.city = data.city || null;
      if (data.state !== undefined) updateData.state = data.state || null;
      if (data.district !== undefined)
        updateData.district = data.district || null;
      if (data.country !== undefined) updateData.country = data.country || null;
      if (data.postalCode !== undefined)
        updateData.postalCode = data.postalCode || null;
      if (data.whatsAppNo !== undefined)
        updateData.whatsAppNo = data.whatsAppNo || null;
      if (updatedPhotoList !== null) {
        updateData.photo = updatedPhotoList;
      }


      // Partner Preference
      if (data.educationQualification1 !== undefined)
        updateData.educationQualification1 =
          data.educationQualification1 || null;
      if (data.educationDetails1 !== undefined)
        updateData.educationDetails1 = data.educationDetails1 || null;
      if (data.complexion1 !== undefined)
        updateData.complexion1 = data.complexion1 || null;
      if (data.personalPreference1 !== undefined)
        updateData.personalPreference1 = data.personalPreference1 || null;
      if (data.willingnessToWork1 !== undefined)
        updateData.willingnessToWork1 = data.willingnessToWork1 || null;
      if (data.fromAge !== undefined)
        updateData.fromAge = cleanIntegerField(data.fromAge);
      if (data.toAge !== undefined)
        updateData.toAge = cleanIntegerField(data.toAge);
      if (data.fromHeight !== undefined)
        updateData.fromHeight = data.fromHeight || null;
      if (data.toHeight !== undefined)
        updateData.toHeight = data.toHeight || null;

      // Update the detail with only provided fields
      await existingDetail.update(updateData);

      res.json({
        success: true,
        message: "Details updated successfully",
        data: existingDetail,
      });
    } catch (error) {
      console.error("Update details error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);



router.delete("/delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await db.UserDetail.destroy({
      where: { user_id: id },
    });

    if (deletedCount > 0) {
      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Soft Delete Routes

// Fetch soft-deleted users
router.get("/deleted-details", async (req, res) => {
  try {
    const deletedDetails = await db.UserDetail.findAll({
      where: { is_deleted: true },
      order: [["updated_at", "DESC"]],
    });
    res.json({
      success: true,
      data: deletedDetails,
    });
  } catch (error) {
    console.error("Fetch deleted details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Soft delete a user
router.put("/soft-delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.UserDetail.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ is_deleted: true });

    res.json({
      success: true,
      message: "User moved to recycle bin",
    });
  } catch (error) {
    console.error("Soft delete error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Restore a user
router.put("/restore-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.UserDetail.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({ is_deleted: false });

    res.json({
      success: true,
      message: "User restored successfully",
    });
  } catch (error) {
    console.error("Restore user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
