import { z } from 'zod';

const trimmedString = z.string().trim();
const optionalTrimmedString = z.string().trim().optional().nullable();
const numericString = z.string().regex(/^\d+$/, "Must be a number").transform(val => parseInt(val, 10)).optional().nullable();
const decimalString = z.string().regex(/^\d+(\.\d+)?$/, "Must be a decimal").transform(val => parseFloat(val)).optional().nullable();

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    forceLogin: z.boolean().optional(),
  })
});

const validTemples = [
  "Nemam Kovil", "Ilayatrangudi", "Iluppakudi", "Iraniyur", 
  "Mathur", "Pillaiyarpatti", "Soorakudi", "Vairavan Kovil", "Velangudi", "Other"
];

const validDivisions = [
  "Kazhani Vaasarkkudaiyar", "Kinginikkurudaiyar", "Okkurudaiyar", 
  "Pattanasamiyar", "Perusenthrudaiyar", "Sirusenthrudaiyar", "Perumaruthurudaiyar",
  "Arumbakkur", "Kannur", "Karuppur", "Kulathur", "Mannur", "Manalur", "Uraiyur",
  "Maruthenthirapuram", "Periya vahuppu", "Pilliyar vahuppu", "Theyyanar vahuppu",
  "NO PIRIVU", "PIRIVU", "Other"
];

const requiredString = (msg) => z.preprocess((val) => (val === undefined || val === null ? "" : val), z.string().trim().min(1, msg));

export const registerSchema = z.object({
  body: z.object({
    name: requiredString("Name is required"),
    email: z.preprocess((val) => (val === undefined || val === null ? "" : val), z.string().trim().min(1, "Email is required").email("Invalid email format")),
    phone: z.preprocess((val) => (val === undefined || val === null ? "" : val), z.string().trim().min(1, "Phone number is required").regex(/^\+?91?\d{10}$|^\d{10}$/, "Phone number must be 10 digits (with or without +91)")),
    otherPhone: optionalTrimmedString,
    password: z.preprocess((val) => (val === undefined || val === null ? "" : val), z.string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .refine(val => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
      .refine(val => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
      .refine(val => /\d/.test(val), "Password must contain at least one number")
      .refine(val => /[!@#$%^&*(),.?":{}|<> ]/.test(val), "Password must contain at least one special character")),
    gender: z.preprocess((val) => (val === undefined || val === null ? "" : val), z.string().min(1, "Gender is required").refine(val => {
      const validGenders = ['Male', 'Female', 'Other', 'ஆண்', 'பெண்', 'மற்றவை'];
      if (!val) return true; // Handled by min(1)
      return validGenders.includes(val);
    }, { message: "Gender is required" })),
    maritalStatus: optionalTrimmedString,
    dateOfBirth: z.preprocess((val) => (val === undefined || val === null ? "" : val), z.string().min(1, "Date of birth is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").refine(val => {
      if (!val) return true; // Handled by min(1)
      const dob = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 22;
    }, { message: "You must be at least 22 years old to register" })),
    yourTemple: z.string().optional().nullable().refine(val => {
      if (!val || val === "") return true;
      return validTemples.includes(val);
    }, { message: "Invalid temple selection" }),
    yourDivision: z.string().optional().nullable().refine(val => {
      if (!val || val === "") return true;
      return validDivisions.includes(val);
    }, { message: "Invalid division selection" }),
    
    // Additional fields from registration_fields.txt
    fatherName: optionalTrimmedString,
    fatherOccupation: optionalTrimmedString,
    motherName: optionalTrimmedString,
    motherOccupation: optionalTrimmedString,
    brothers: z.any().optional(),
    brothersMarried: z.any().optional(),
    sisters: z.any().optional(),
    sistersMarried: z.any().optional(),
    knownLanguages: optionalTrimmedString,
    reference: optionalTrimmedString,
    nativePlace: optionalTrimmedString,
    nativePlaceHouseName: optionalTrimmedString,
    presentResidence: optionalTrimmedString,
    pincode: optionalTrimmedString,
    profileCreatedBy: optionalTrimmedString,
    referredBy: optionalTrimmedString,
    referralDetails1Name: optionalTrimmedString,
    referralDetails1Phone: optionalTrimmedString,
    referralDetails1Email: optionalTrimmedString,
    referralDetails2Name: optionalTrimmedString,
    referralDetails2Phone: optionalTrimmedString,
    referralDetails2Email: optionalTrimmedString,
    educationQualification: optionalTrimmedString,
    otherEducation: optionalTrimmedString,
    occupationBusiness: optionalTrimmedString,
    otherOccupation: optionalTrimmedString,
    workingPlace: optionalTrimmedString,
    workDetails: optionalTrimmedString,
    educationDetails: optionalTrimmedString,
    income: z.any().optional(),
    height: optionalTrimmedString,
    complexion: optionalTrimmedString,
    weight: optionalTrimmedString,
    diet: optionalTrimmedString,
    specialCases: optionalTrimmedString,
    specialCasesDetails: optionalTrimmedString,
    zodiacSign: optionalTrimmedString,
    ascendant: optionalTrimmedString,
    birthStar: optionalTrimmedString,
    dosham: optionalTrimmedString,
    placeOfBirth: optionalTrimmedString,
    timeOfBirthHours: z.any().optional(),
    timeOfBirthMinutes: z.any().optional(),
    timeOfBirthSeconds: z.any().optional(),
    DasaType: optionalTrimmedString,
    dasaRemainYears: z.any().optional(),
    dasaRemainMonths: z.any().optional(),
    dasaRemainDays: z.any().optional(),
    fullStreetAddress: optionalTrimmedString,
    city: optionalTrimmedString,
    state: optionalTrimmedString,
    district: optionalTrimmedString,
    country: optionalTrimmedString,
    postalCode: optionalTrimmedString,
    whatsAppNo: optionalTrimmedString,
    educationQualification1: optionalTrimmedString,
    educationDetails1: optionalTrimmedString,
    complexion1: optionalTrimmedString,
    personalPreference1: optionalTrimmedString,
    willingnessToWork1: optionalTrimmedString,
    fromAge: z.any().optional(),
    toAge: z.any().optional(),
    fromHeight: optionalTrimmedString,
    toHeight: optionalTrimmedString,
    occupationBusiness1: optionalTrimmedString,
    workingPlace1: optionalTrimmedString,
    otherEducation1: optionalTrimmedString,
    otherOccupation1: optionalTrimmedString,
    
    // Astrology chart fields
    sooriyan: z.any().optional(),
    chandiran: z.any().optional(),
    sevai: z.any().optional(),
    budhan: z.any().optional(),
    viyazhan: z.any().optional(),
    sukkiran: z.any().optional(),
    sani: z.any().optional(),
    rahu: z.any().optional(),
    maanthi: z.any().optional(),
    kethu: z.any().optional(),
    lagnam: z.any().optional(),
    amsam_sooriyan: z.any().optional(),
    amsam_chandiran: z.any().optional(),
    amsam_sevai: z.any().optional(),
    amsam_budhan: z.any().optional(),
    amsam_viyazhan: z.any().optional(),
    amsam_sukkiran: z.any().optional(),
    amsam_sani: z.any().optional(),
    amsam_rahu: z.any().optional(),
    amsam_maanthi: z.any().optional(),
    amsam_kethu: z.any().optional(),
    amsam_lagnam: z.any().optional(),
    
    // Missing fields from UserDetail.js
    referralDetails1Address: optionalTrimmedString,
    referralDetails2Address: optionalTrimmedString,
    photo: z.any().optional(),
    sessionId: optionalTrimmedString,
    updated_at: z.any().optional(),
    is_deleted: z.boolean().optional(),
  }).passthrough()
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: optionalTrimmedString,
    email: z.string().trim().email("Invalid email format").optional(),
    phone: optionalTrimmedString,
    otherPhone: optionalTrimmedString,
    gender: z.enum(['Male', 'Female', 'Other', 'ஆண்', 'பெண்', 'மற்றவை']).optional(),
    maritalStatus: optionalTrimmedString,
    fatherName: optionalTrimmedString,
    fatherOccupation: optionalTrimmedString,
    motherName: optionalTrimmedString,
    motherOccupation: optionalTrimmedString,
    brothers: z.any().optional(), // Using any for now to handle various input formats
    brothersMarried: z.any().optional(),
    sisters: z.any().optional(),
    sistersMarried: z.any().optional(),
    yourTemple: optionalTrimmedString,
    yourDivision: optionalTrimmedString,
    knownLanguages: optionalTrimmedString,
    reference: optionalTrimmedString,
    nativePlace: optionalTrimmedString,
    nativePlaceHouseName: optionalTrimmedString,
    presentResidence: optionalTrimmedString,
    pincode: optionalTrimmedString,
    profileCreatedBy: optionalTrimmedString,
    referredBy: optionalTrimmedString,
    educationQualification: optionalTrimmedString,
    otherEducation: optionalTrimmedString,
    occupationBusiness: optionalTrimmedString,
    otherOccupation: optionalTrimmedString,
    workingPlace: optionalTrimmedString,
    workDetails: optionalTrimmedString,
    educationDetails: optionalTrimmedString,
    income: z.any().optional(),
    height: optionalTrimmedString,
    complexion: optionalTrimmedString,
    weight: optionalTrimmedString,
    diet: optionalTrimmedString,
    specialCases: optionalTrimmedString,
    specialCasesDetails: optionalTrimmedString,
    zodiacSign: optionalTrimmedString,
    ascendant: optionalTrimmedString,
    birthStar: optionalTrimmedString,
    dosham: optionalTrimmedString,
    placeOfBirth: optionalTrimmedString,
    dateOfBirth: optionalTrimmedString,
    photoPassword: optionalTrimmedString,
    // Astrology chart fields
    sooriyan: z.any().optional(),
    chandiran: z.any().optional(),
    sevai: z.any().optional(),
    budhan: z.any().optional(),
    viyazhan: z.any().optional(),
    sukkiran: z.any().optional(),
    sani: z.any().optional(),
    rahu: z.any().optional(),
    maanthi: z.any().optional(),
    kethu: z.any().optional(),
    lagnam: z.any().optional(),
  }).passthrough()
});

export const verifyPhotoPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  })
});
