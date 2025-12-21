import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";

const UserDetail = sequelize.define(
  "UserDetail",
  {
    user_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Step 1 - Basic Details (27 fields)
    name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    gender: {
      type: Sequelize.ENUM("Male", "Female", "Other", "ஆண்", "பெண்", "மற்றவை"),
      allowNull: true,
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },

    maritalStatus: {
      type: Sequelize.ENUM("unmarried", "widow", "divorced", "widower", "திருமணமாகாதவர்", "விதவை", "விவாகரத்து", "கைம்பெண்"),
      allowNull: true,
    },
    fatherName: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    fatherOccupation: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    motherName: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    motherOccupation: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    brothers: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    brothersMarried: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sisters: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sistersMarried: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    yourTemple: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    yourDivision: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    knownLanguages: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    reference: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    nativePlace: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    nativePlaceHouseName: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    presentResidence: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    pincode: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    profileCreatedBy: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    referredBy: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    referralDetails1Name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    referralDetails1Phone: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    referralDetails1Address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    referralDetails2Name: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    referralDetails2Phone: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    referralDetails2Address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    // Step 2 - Education & Occupation (8 fields)
    educationQualification: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    otherEducation: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    occupationBusiness: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    otherOccupation: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    workingPlace: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    workDetails: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    educationDetails: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    income: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    },
    // Step 3 - Physical Attributes (6 fields)
    height: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    complexion: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    weight: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    diet: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    specialCases: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    specialCasesDetails: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    // Step 4 - Astrology Basic Details (13 fields)
    zodiacSign: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    ascendant: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    birthStar: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    dosham: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    placeOfBirth: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    dateOfBirth: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    timeOfBirthHours: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    timeOfBirthMinutes: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    timeOfBirthSeconds: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    DasaType: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    dasaRemainYears: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    dasaRemainMonths: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    dasaRemainDays: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    // Step 5 - Full Horoscope Chart (22 fields)
    sooriyan: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    chandiran: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sevai: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    budhan: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    viyazhan: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sukkiran: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sani: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    rahu: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    maanthi: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    kethu: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    lagnam: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_sooriyan: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_chandiran: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_sevai: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_budhan: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_viyazhan: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_sukkiran: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_sani: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_rahu: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_maanthi: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_kethu: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    amsam_lagnam: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    // Step 6 - Contact Details (10 fields)
    fullStreetAddress: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    city: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    state: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    district: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    country: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    postalCode: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    phone: {
      type: Sequelize.STRING(20),
      unique: true,
      allowNull: true,
    },
    otherPhone: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    whatsAppNo: {
      type: Sequelize.STRING(20),
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING(255),
      unique: true,
      allowNull: true,
    },
    photoPassword: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    photo: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'JSON array of photo paths, max 5 photos',
    },
    // Step 7 - Partner Preference (13 fields)
    educationQualification1: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    otherEducation1: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    educationDetails1: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    occupationBusiness1: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    otherOccupation1: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    workingPlace1: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },
    complexion1: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    personalPreference1: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    willingnessToWork1: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    fromAge: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    toAge: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    fromHeight: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    toHeight: {
      type: Sequelize.STRING(50),
      allowNull: true,
    },
    // Timestamps
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      onUpdate: Sequelize.NOW,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "userdetails",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default UserDetail;
