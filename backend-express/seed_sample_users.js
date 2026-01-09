
import "dotenv/config";
import db from "./models/index.js";
import bcrypt from "bcrypt";

async function seedUsers() {
  try {
    await db.sequelize.authenticate();
    console.log("Connected to database for seeding...");

    const hashedPassword = await bcrypt.hash("password123", 10);
    const users = [];

    // Generate 25 Boys
    for (let i = 1; i <= 25; i++) {
        users.push({
            name: `Boy User ${i}`,
            email: `boy${i}@test.com`,
            password: hashedPassword,
            gender: "Male",
            maritalStatus: "unmarried",
            fatherName: `Father of Boy ${i}`,
            fatherOccupation: "Business",
            motherName: `Mother of Boy ${i}`,
            motherOccupation: "Homemaker",
            brothers: 1,
            sisters: 1,
            yourTemple: "Temple A",
            yourDivision: "Division A",
            knownLanguages: "Tamil, English",
            reference: "Self",
            nativePlace: "Karaikudi",
            nativePlaceHouseName: "House A",
            presentResidence: "Chennai",
            pincode: "600001",
            profileCreatedBy: "Self",
            referredBy: "None",
            referralDetails1Name: "Ref 1",
            referralDetails1Phone: "9876543210",
            referralDetails1Address: "Addr 1",
            referralDetails2Name: "Ref 2",
            referralDetails2Phone: "9876543210",
            referralDetails2Address: "Addr 2",
            educationQualification: "B.E",
            otherEducation: "MBA",
            occupationBusiness: "Software Engineer",
            otherOccupation: "None",
            workingPlace: "Chennai",
            workDetails: "IT Company",
            educationDetails: "Engineering",
            income: 12.0,
            height: "5.10",
            complexion: "Fair",
            weight: "75",
            diet: "Non-Veg",
            specialCases: "No",
            specialCasesDetails: "",
            zodiacSign: "Mesham",
            ascendant: "Rishabam",
            birthStar: "Ashwini",
            dosham: "No",
            placeOfBirth: "Karaikudi",
            dateOfBirth: new Date(1995, 0, i), // varied dates
            timeOfBirthHours: 10,
            timeOfBirthMinutes: 30,
            timeOfBirthSeconds: 0,
            DasaType: "Rahu",
            dasaRemainYears: 2,
            dasaRemainMonths: 5,
            dasaRemainDays: 10,
            sooriyan: 1, chandiran: 2, sevai: 3, budhan: 4, viyazhan: 5, sukkiran: 6, sani: 7, rahu: 8, kethu: 9, lagnam: 10, maanthi: 11,
            amsam_sooriyan: 1, amsam_chandiran: 2, amsam_sevai: 3, amsam_budhan: 4, amsam_viyazhan: 5, amsam_sukkiran: 6, amsam_sani: 7, amsam_rahu: 8, amsam_kethu: 9, amsam_lagnam: 10, amsam_maanthi: 11,
            fullStreetAddress: "123 Street",
            city: "Chennai",
            state: "Tamil Nadu",
            district: "Chennai",
            country: "India",
            postalCode: "600001",
            phone: `90000000${i.toString().padStart(2, '0')}`,
            otherPhone: "",
            whatsAppNo: `90000000${i.toString().padStart(2, '0')}`,
            photoPassword: "",
            photo: JSON.stringify(["uploads/boy_car.png"]), // Pointing to the image we copied
            sessionId: null,
             educationQualification1: "Any",
            educationDetails1: "Any",
            occupationBusiness1: "Any",
            otherOccupation1: "Any",
            workingPlace1: "Any",
            complexion1: "Any",
            personalPreference1: "None",
            willingnessToWork1: "Yes",
            fromAge: 20,
            toAge: 30,
            fromHeight: "5.0",
            toHeight: "6.0",
            created_at: new Date(),
            updated_at: new Date(),
            is_deleted: false
        });
    }

    // Generate 25 Girls
    for (let i = 1; i <= 25; i++) {
         users.push({
            name: `Girl User ${i}`,
            email: `girl${i}@test.com`,
            password: hashedPassword,
            gender: "Female",
            maritalStatus: "unmarried",
            fatherName: `Father of Girl ${i}`,
            fatherOccupation: "Business",
            motherName: `Mother of Girl ${i}`,
            motherOccupation: "Homemaker",
            brothers: 1,
            sisters: 1,
            yourTemple: "Temple B",
            yourDivision: "Division B",
            knownLanguages: "Tamil, English",
            reference: "Self",
            nativePlace: "Madurai",
            nativePlaceHouseName: "House B",
            presentResidence: "Madurai",
            pincode: "625001",
            profileCreatedBy: "Self",
            referredBy: "None",
            referralDetails1Name: "Ref 1",
            referralDetails1Phone: "9876543210",
            referralDetails1Address: "Addr 1",
            referralDetails2Name: "Ref 2",
            referralDetails2Phone: "9876543210",
            referralDetails2Address: "Addr 2",
            educationQualification: "B.Sc",
            otherEducation: "M.Sc",
            occupationBusiness: "Teacher",
            otherOccupation: "None",
            workingPlace: "Madurai",
            workDetails: "School",
            educationDetails: "Science",
            income: 8.0,
            height: "5.5",
            complexion: "Fair",
            weight: "60",
            diet: "Veg",
            specialCases: "No",
            specialCasesDetails: "",
            zodiacSign: "Rishabam",
            ascendant: "Mithunam",
            birthStar: "Rohini",
            dosham: "No",
            placeOfBirth: "Madurai",
            dateOfBirth: new Date(1996, 0, i), // varied dates
            timeOfBirthHours: 10,
            timeOfBirthMinutes: 30,
            timeOfBirthSeconds: 0,
            DasaType: "Guru",
            dasaRemainYears: 5,
            dasaRemainMonths: 2,
            dasaRemainDays: 10,
            sooriyan: 1, chandiran: 2, sevai: 3, budhan: 4, viyazhan: 5, sukkiran: 6, sani: 7, rahu: 8, kethu: 9, lagnam: 10, maanthi: 11,
            amsam_sooriyan: 1, amsam_chandiran: 2, amsam_sevai: 3, amsam_budhan: 4, amsam_viyazhan: 5, amsam_sukkiran: 6, amsam_sani: 7, amsam_rahu: 8, amsam_kethu: 9, amsam_lagnam: 10, amsam_maanthi: 11,
            fullStreetAddress: "456 Street",
            city: "Madurai",
            state: "Tamil Nadu",
            district: "Madurai",
            country: "India",
            postalCode: "625001",
            phone: `91000000${i.toString().padStart(2, '0')}`,
            otherPhone: "",
            whatsAppNo: `91000000${i.toString().padStart(2, '0')}`,
            photoPassword: "",
            photo: JSON.stringify(["uploads/girl_flower.png"]), // Pointing to the image we copied
            sessionId: null,
            educationQualification1: "Any",
            educationDetails1: "Any",
            occupationBusiness1: "Any",
            otherOccupation1: "Any",
            workingPlace1: "Any",
            complexion1: "Any",
            personalPreference1: "None",
            willingnessToWork1: "Yes",
            fromAge: 24,
            toAge: 32,
            fromHeight: "5.5",
            toHeight: "6.2",
            created_at: new Date(),
            updated_at: new Date(),
            is_deleted: false
        });
    }

    // Insert Users
    console.log("Starting insertion...");
    for (const user of users) {
        // Check if exists
        const exists = await db.UserDetail.findOne({ where: { email: user.email } });
        if (!exists) {
            await db.UserDetail.create(user);
        } else {
             // Optional: Update
             // await exists.update(user);
             console.log(`User ${user.email} already exists. Skipping.`);
        }
    }
    console.log("Successfully processed 50 users.");

  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await db.sequelize.close();
  }
}

seedUsers();
