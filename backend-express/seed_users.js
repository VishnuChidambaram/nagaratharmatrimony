import "dotenv/config";
import db from "./models/index.js";
import bcrypt from "bcrypt";

async function seedUsers() {
  try {
    await db.sequelize.authenticate();
    console.log("Connected to database for seeding...");

    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = [];
    const boysNames = ["Arun", "Bala", "Chandru", "Dinesh", "Elango", "Ganesh", "Hari", "Indran", "Jagan", "Karthik", "Mani", "Naveen", "Omkar", "Prabhu", "Qadir", "Ramesh", "Suresh", "Tamil", "Uday", "Vicky", "Walter", "Xavier", "Yogan", "Zahir", "Anand"];
    const girlsNames = ["Anitha", "Bhavani", "Chitra", "Divya", "Eswari", "Gayathri", "Hima", "Indira", "Janani", "Kavya", "Meena", "Nandhini", "Oviya", "Priya", "Quincy", "Ramya", "Sneha", "Thara", "Uma", "Vani", "Wendy", "Xena", "Yamini", "Zara", "Aishwarya"];

    // Generate 25 Boys
    for (let i = 0; i < 25; i++) {
        users.push(createUserObj(boysNames[i], "Male", i, hashedPassword));
    }

    // Generate 25 Girls
    for (let i = 0; i < 25; i++) {
        users.push(createUserObj(girlsNames[i], "Female", i + 25, hashedPassword));
    }

    // Bulk Update or Create
    console.log(`Seeding/Updating ${users.length} users...`);
    
    for (const user of users) {
        // Check if exists
        const existing = await db.UserDetail.findOne({ where: { email: user.email } });
        if (!existing) {
            await db.UserDetail.create(user);
        } else {
             // Force update all fields
             await existing.update(user);
        }
    }

    console.log("Seeding complete!");

  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await db.sequelize.close();
  }
}

function createUserObj(name, gender, index, hashedPassword) {
    // Using Picsum Photos with specific IDs for consistent, unchangeable images
    // Male users get IDs 100-124, Female users get IDs 200-224
    const maleImageId = 100 + index;
    const femaleImageId = 200 + (index - 25);
    
    const photoUrl = gender === "Male" 
        ? `https://picsum.photos/id/${maleImageId}/400/400`
        : `https://picsum.photos/id/${femaleImageId}/400/400`;
    
    const photoJson = JSON.stringify([photoUrl]);

    const isMale = gender === "Male";

    // Valid Temples and Divisions from Frontend
    const templeData = {
        "Ilayatrangudi": ["Kazhani Vaasarkkudaiyar", "Kinginikkurudaiyar", "Okkurudaiyar", "Pattanasamiyar", "Perusenthrudaiyar", "Sirusenthrudaiyar", "Perumaruthurudaiyar"],
        "Mathur": ["Arumbakkur", "Kannur", "Karuppur", "Kulathur", "Mannur", "Manalur", "Uraiyur"],
        "Vairavan Kovil": ["Kazhani Vaasarkkudaiyar", "Maruthenthirapuram", "Periya vahuppu", "Pilliyar vahuppu", "Theyyanar vahuppu"],
        "Nemam Kovil": ["NO PIRIVU"],
        "Iluppakudi": ["NO PIRIVU"],
        "Iraniyur": ["NO PIRIVU"],
        "Pillaiyarpatti": ["NO PIRIVU"],
        "Soorakudi": ["NO PIRIVU"],
        "Velangudi": ["NO PIRIVU"]
    };

    const temples = Object.keys(templeData);
    const randomTemple = temples[Math.floor(Math.random() * temples.length)];
    const divisions = templeData[randomTemple];
    const randomDivision = divisions[Math.floor(Math.random() * divisions.length)];

    return {
      // Step 1 - Basic Details
      name: `${name} User`,
      gender: gender,
      password: hashedPassword,
      maritalStatus: "unmarried",
      fatherName: `${name}'s Father`,
      fatherOccupation: "Business Owner",
      motherName: `${name}'s Mother`,
      motherOccupation: "Home Maker",
      brothers: 1,
      brothersMarried: 0,
      sisters: 1,
      sistersMarried: 1,
      yourTemple: randomTemple,
      yourDivision: randomDivision,
      knownLanguages: "English, Tamil, Hindi",
      reference: "Uncle",
      nativePlace: "Karaikudi",
      nativePlaceHouseName: "Heritage Villa",
      presentResidence: "Chennai",
      pincode: "600001",
      profileCreatedBy: "Self",
      referredBy: "Friend",
      referralDetails1Name: "Raja",
      referralDetails1Phone: "9876543210",
      referralDetails1Address: "1st St, Chennai",
      referralDetails2Name: "Rani",
      referralDetails2Phone: "9876543211",
      referralDetails2Address: "2nd St, Madurai",

      // Step 2 - Education & Occupation
      educationQualification: "B.E. Computer Science",
      otherEducation: "MBA",
      occupationBusiness: "Software Engineer",
      otherOccupation: "Freelance Consultant",
      workingPlace: "Chennai",
      workDetails: "Working at MNC",
      educationDetails: "Graduated from Anna University",
      income: 12.5,

      // Step 3 - Physical Attributes
      height: isMale ? "5.9" : "5.4",
      complexion: "Fair",
      weight: isMale ? "75" : "60",
      diet: "Non-Veg",
      specialCases: "No",
      specialCasesDetails: "None",

      // Step 4 - Astrology Basic Details
      zodiacSign: "Simmam", // Leo
      ascendant: "Kumbam", // Aquarius
      birthStar: "Magam",
      dosham: "No",
      placeOfBirth: "Madurai",
      dateOfBirth: new Date("1998-05-20"),
      timeOfBirthHours: 10,
      timeOfBirthMinutes: 30,
      timeOfBirthSeconds: 0,
      DasaType: "Rahu",
      dasaRemainYears: 2,
      dasaRemainMonths: 5,
      dasaRemainDays: 10,

      // Step 5 - Full Horoscope Chart
      sooriyan: 1,
      chandiran: 2,
      sevai: 3,
      budhan: 4,
      viyazhan: 5,
      sukkiran: 6,
      sani: 7,
      rahu: 8,
      maanthi: 9,
      kethu: 10,
      lagnam: 11,

      amsam_sooriyan: 1,
      amsam_chandiran: 2,
      amsam_sevai: 3,
      amsam_budhan: 4,
      amsam_viyazhan: 5,
      amsam_sukkiran: 6,
      amsam_sani: 7,
      amsam_rahu: 8,
      amsam_maanthi: 9,
      amsam_kethu: 10,
      amsam_lagnam: 11,

      // Step 6 - Contact Details
      fullStreetAddress: "123, South Street, T.Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      district: "Chennai",
      country: "India",
      postalCode: "600017",
      phone: `98765${String(index).padStart(5, '0')}`,
      otherPhone: `87654${String(index).padStart(5, '0')}`,
      whatsAppNo: `98765${String(index).padStart(5, '0')}`,
      email: `${name.toLowerCase()}${index}@test.com`,
      photo: photoJson,
      photoPassword: null,
      sessionId: null,

      // Step 7 - Partner Preference
      educationQualification1: "Any Degree",
      otherEducation1: "Any",
      educationDetails1: "Must be a graduate",
      occupationBusiness1: "Any",
      otherOccupation1: "Not specific",
      workingPlace1: "Tamil Nadu",
      complexion1: "Fair",
      personalPreference1: "Looking for a kind and caring partner.",
      willingnessToWork1: "Yes",
      fromAge: 20,
      toAge: 30,
      fromHeight: "5.0",
      toHeight: "6.0",
      
      // Timestamps
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false
    };
}

seedUsers();
