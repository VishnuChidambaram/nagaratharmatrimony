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

    const maritalStatuses = ["unmarried", "widow", "divorced", "widower"];
    const status = maritalStatuses[index % maritalStatuses.length];

    const educationQualifications = ["B.E. Computer Science", "B.Tech IT", "MBBS", "B.Arch", "B.Com", "B.Sc Physics"];
    const randomEdu = educationQualifications[index % educationQualifications.length];

    const occupations = ["Software Engineer", "Business Owner", "Doctor", "Architect", "Manager", "Analyst"];
    const randomOcc = occupations[index % occupations.length];

    const cities = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Karaikudi"];
    const randomCity = cities[index % cities.length];

    const birthStars = ["Magam", "Rohini", "Ashwini", "Bharani", "Krittika", "Mrigashira", "Ardra", "Punarvasu", "Pushya"];
    const randomStar = birthStars[index % birthStars.length];

    const zodiacSigns = ["Simmam", "Rishabam", "Mesham", "Mithunam", "Kadagam", "Kanni", "Thula", "Viruchigam"];
    const randomZodiac = zodiacSigns[index % zodiacSigns.length];

    return {
      // Step 1 - Basic Details (27 fields)
      name: `${name} User`,
      gender: gender,
      password: hashedPassword,
      maritalStatus: status,
      fatherName: `${name}'s Father`,
      fatherOccupation: "Retired Professional",
      motherName: `${name}'s Mother`,
      motherOccupation: "Home Maker",
      brothers: index % 3,
      brothersMarried: index % 2,
      sisters: (index + 1) % 3,
      sistersMarried: (index + 1) % 2,
      yourTemple: randomTemple,
      yourDivision: randomDivision,
      knownLanguages: "English, Tamil, Hindi",
      reference: "Website",
      nativePlace: "Karaikudi",
      nativePlaceHouseName: "Chettinad Mansion",
      presentResidence: randomCity,
      pincode: "60000" + (index % 10 + 1),
      profileCreatedBy: "Self",
      referredBy: "Family",
      referralDetails1Name: "Referral Name 1",
      referralDetails1Phone: "9840012345",
      referralDetails1Email: "ref1@test.com",
      referralDetails1Address: "123, Sample Street, Chennai",
      referralDetails2Name: "Referral Name 2",
      referralDetails2Phone: "9840054321",
      referralDetails2Email: "ref2@test.com",
      referralDetails2Address: "456, Demo Avenue, Chennai",

      // Step 2 - Education & Occupation (8 fields)
      educationQualification: randomEdu,
      otherEducation: "Post Graduation",
      occupationBusiness: randomOcc,
      otherOccupation: "Part-time Specialist",
      workingPlace: randomCity,
      workDetails: `Lead role at ${randomOcc} firm`,
      educationDetails: `Graduate from Top University in ${randomEdu}`,
      income: 15.0 + (index % 10),

      // Step 3 - Physical Attributes (6 fields)
      height: isMale ? "5.9" : "5.4",
      complexion: index % 2 === 0 ? "Fair" : "Medium",
      weight: isMale ? "75" : "60",
      diet: index % 3 === 0 ? "Veg" : "Non-Veg",
      specialCases: "No",
      specialCasesDetails: "None",

      // Step 4 - Astrology Basic Details (13 fields)
      zodiacSign: randomZodiac,
      ascendant: "Kumbam",
      birthStar: randomStar,
      dosham: index % 4 === 0 ? "Yes" : "No",
      placeOfBirth: "Madurai",
      dateOfBirth: new Date(1990 + (index % 10), index % 12, (index % 28) + 1),
      timeOfBirthHours: 10,
      timeOfBirthMinutes: 30,
      timeOfBirthSeconds: 0,
      DasaType: "Rahu",
      dasaRemainYears: index % 10,
      dasaRemainMonths: index % 12,
      dasaRemainDays: index % 30,

      // Step 5 - Full Horoscope Chart (22 fields)
      sooriyan: (index % 12) + 1,
      chandiran: ((index + 1) % 12) + 1,
      sevai: ((index + 2) % 12) + 1,
      budhan: ((index + 3) % 12) + 1,
      viyazhan: ((index + 4) % 12) + 1,
      sukkiran: ((index + 5) % 12) + 1,
      sani: ((index + 6) % 12) + 1,
      rahu: ((index + 7) % 12) + 1,
      maanthi: ((index + 8) % 12) + 1,
      kethu: ((index + 9) % 12) + 1,
      lagnam: ((index + 10) % 12) + 1,

      amsam_sooriyan: (index % 12) + 1,
      amsam_chandiran: ((index + 1) % 12) + 1,
      amsam_sevai: ((index + 2) % 12) + 1,
      amsam_budhan: ((index + 3) % 12) + 1,
      amsam_viyazhan: ((index + 4) % 12) + 1,
      amsam_sukkiran: ((index + 5) % 12) + 1,
      amsam_sani: ((index + 6) % 12) + 1,
      amsam_rahu: ((index + 7) % 12) + 1,
      amsam_maanthi: ((index + 8) % 12) + 1,
      amsam_kethu: ((index + 9) % 12) + 1,
      amsam_lagnam: ((index + 10) % 12) + 1,

      // Step 6 - Contact Details (10 fields)
      fullStreetAddress: `${index + 1}01, Platinum Tower, T.Nagar`,
      city: "Chennai",
      state: "Tamil Nadu",
      district: "Chennai",
      country: "India",
      postalCode: "600017",
      phone: `9${String(index).padStart(9, '0')}`,
      otherPhone: `8${String(index).padStart(9, '0')}`,
      whatsAppNo: `9${String(index).padStart(9, '0')}`,
      email: `${name.toLowerCase()}${index}@test.com`,
      photo: photoJson,
      photoPassword: null,
      sessionId: null,

      // Step 7 - Partner Preference (13 fields)
      educationQualification1: "B.E. / B.Tech / MBA",
      otherEducation1: "Any Professional Degree",
      educationDetails1: "Must be well educated",
      occupationBusiness1: "Private Sector / Business",
      otherOccupation1: "Not specific",
      workingPlace1: "Tamil Nadu or Bangalore",
      complexion1: "Fair",
      personalPreference1: "Looking for a compatible life partner with similar values.",
      willingnessToWork1: "Yes",
      fromAge: isMale ? 22 : 25,
      toAge: isMale ? 28 : 35,
      fromHeight: isMale ? "5.0" : "5.5",
      toHeight: isMale ? "5.8" : "6.2",
      
      // Timestamps
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false
    };
}

seedUsers();
