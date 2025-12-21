import "dotenv/config";
import db from "./models/index.js";
import bcrypt from "bcrypt";

async function insertUser() {
  try {
    await db.sequelize.authenticate();
    console.log("Connected to database");

    const hashedPassword = await bcrypt.hash("password", 10);

    const user = {
      name: "Full Detail User",
      email: "detail@test.com",
      password: hashedPassword,
      gender: "Male",
      maritalStatus: "unmarried",
      fatherName: "Father Name",
      fatherOccupation: "Father Job",
      motherName: "Mother Name",
      motherOccupation: "Mother Job",
      brothers: 1,
      sisters: 1,
      yourTemple: "Temple Name",
      yourDivision: "Division Name",
      knownLanguages: "English, Tamil",
      reference: "Reference Name",
      nativePlace: "Native Place",
      nativePlaceHouseName: "House Name",
      presentResidence: "Residence Address",
      pincode: "123456",
      profileCreatedBy: "Self",
      referredBy: "Referrer",
      referralDetails1Name: "Ref 1",
      referralDetails1Phone: "9876543210",
      referralDetails1Address: "Ref 1 Addr",
      referralDetails2Name: "Ref 2",
      referralDetails2Phone: "9876543210",
      referralDetails2Address: "Ref 2 Addr",
      
      educationQualification: "Graduate",
      otherEducation: "Diploma",
      occupationBusiness: "Engineer",
      otherOccupation: "Freelancer",
      workingPlace: "Chennai",
      workDetails: "Software Engineer",
      educationDetails: "B.E. CSE",
      income: 10.5,
      
      height: "5.8",
      weight: "70",
      complexion: "Fair",
      diet: "Non-Veg",
      specialCases: "No",
      specialCasesDetails: "",
      
      zodiacSign: "Aries",
      ascendant: "Taurus",
      birthStar: "Ashwini",
      dosham: "No",
      placeOfBirth: "Chennai",
      dateOfBirth: "1995-01-01",
      timeOfBirthHours: 10,
      timeOfBirthMinutes: 30,
      timeOfBirthSeconds: 0,
      DasaType: "Rahu",
      dasaRemainYears: 2,
      dasaRemainMonths: 5,
      dasaRemainDays: 10,
      
      sooriyan: 1,
      chandiran: 2,
      sevai: 3,
      budhan: 4,
      viyazhan: 5,
      sukkiran: 6,
      sani: 7,
      rahu: 8,
      kethu: 9,
      lagnam: 10,
      maanthi: 11,
      
      amsam_sooriyan: 1,
      amsam_chandiran: 2,
      amsam_sevai: 3,
      amsam_budhan: 4,
      amsam_viyazhan: 5,
      amsam_sukkiran: 6,
      amsam_sani: 7,
      amsam_rahu: 8,
      amsam_kethu: 9,
      amsam_lagnam: 10,
      amsam_maanthi: 11,
      
      fullStreetAddress: "123 Main St",
      city: "Chennai",
      state: "Tamil Nadu",
      district: "Chennai",
      country: "India",
      postalCode: "600001",
      phone: "9876543210",
      whatsAppNo: "9876543210",
      
      educationQualification1: "Any",
      educationDetails1: "Any Degree",
      complexion1: "Fair",
      personalPreference1: "Good nature",
      willingnessToWork1: "Yes",
      fromAge: 22,
      toAge: 28,
      fromHeight: "5.0",
      toHeight: "6.0"
    };

    // Check if user exists
    const existing = await db.UserDetail.findOne({ where: { email: user.email } });
    if (existing) {
      console.log("User already exists, updating...");
      await existing.update(user);
    } else {
      console.log("Creating new user...");
      await db.UserDetail.create(user);
    }

    console.log("User inserted/updated successfully");
  } catch (error) {
    console.error("Error inserting user:", error);
  } finally {
    await db.sequelize.close();
  }
}

insertUser();
