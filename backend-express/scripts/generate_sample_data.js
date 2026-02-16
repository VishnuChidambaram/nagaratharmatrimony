import UserDetail from "../models/UserDetail.js";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";

const GENDERS = ["Male", "Female"];
const TEMPLES = [
  "Ilayathangudi", "Mathur", "Vairavankoil", "Nemamkoil", 
  "Iraniyur", "Pillaiyarpatti", "Illuppaikudi", "Soorakudi", "Velangudi"
];
const DIVISIONS = ["Division A", "Division B", "Division C", "Common"];
const EDUCATION = ["B.E.", "M.B.B.S.", "B.Com", "M.C.A.", "Ph.D.", "B.Tech", "Aeronautical Engineering"];
const OCCUPATIONS = ["Software Engineer", "Doctor", "Bank Manager", "Business Owner", "Teacher", "Architect"];
const DISTRICTS = ["Chennai", "Karaikudi", "Madurai", "Sivaganga", "Trichy", "Coimbatore"];
const RASI_LIST = ["Mesham", "Rishabam", "Midhunam", "Kadagam", "Simmam", "Kanni", "Thulaam", "Viruchigam", "Dhanusu", "Magaram", "Kumbam", "Meenam"];
const STARS = ["Ashwini", "Bharani", "Krithika", "Rohini", "Mrigashira", "Arudra", "Punarvasu", "Pushya", "Ashlesha"];

async function generateData() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const password = await bcrypt.hash("SamplePassword123", 10);
    const users = [];

    for (let i = 1; i <= 300; i++) {
      const gender = i <= 150 ? "Male" : "Female";
      const name = gender === "Male" ? `SampleMale${i}` : `SampleFemale${i - 150}`;
      const email = `user${i}@example.com`;
      const phone = `9840000${i.toString().padStart(3, '0')}`;
      
      const user = {
        name,
        gender,
        password,
        email,
        phone,
        maritalStatus: "unmarried",
        fatherName: `Father of ${name}`,
        motherName: `Mother of ${name}`,
        yourTemple: TEMPLES[Math.floor(Math.random() * TEMPLES.length)],
        yourDivision: DIVISIONS[Math.floor(Math.random() * DIVISIONS.length)],
        nativePlace: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
        educationQualification: EDUCATION[Math.floor(Math.random() * EDUCATION.length)],
        occupationBusiness: OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)],
        income: (Math.random() * 2000000 + 500000).toFixed(2),
        height: `${Math.floor(Math.random() * 40 + 150)} cm`,
        weight: `${Math.floor(Math.random() * 40 + 50)} kg`,
        complexion: i % 2 === 0 ? "Fair" : "Medium",
        diet: "Vegetarian",
        zodiacSign: RASI_LIST[Math.floor(Math.random() * RASI_LIST.length)],
        birthStar: STARS[Math.floor(Math.random() * STARS.length)],
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        placeOfBirth: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
        city: DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)],
        state: "Tamil Nadu",
        country: "India",
        // Astrological charts (Rasi and Amsam) - using values 1-12 for houses
        sooriyan: Math.floor(Math.random() * 12) + 1,
        chandiran: Math.floor(Math.random() * 12) + 1,
        sevai: Math.floor(Math.random() * 12) + 1,
        budhan: Math.floor(Math.random() * 12) + 1,
        viyazhan: Math.floor(Math.random() * 12) + 1,
        sukkiran: Math.floor(Math.random() * 12) + 1,
        sani: Math.floor(Math.random() * 12) + 1,
        rahu: Math.floor(Math.random() * 12) + 1,
        kethu: Math.floor(Math.random() * 12) + 1,
        lagnam: Math.floor(Math.random() * 12) + 1,
        amsam_sooriyan: Math.floor(Math.random() * 12) + 1,
        amsam_chandiran: Math.floor(Math.random() * 12) + 1,
        amsam_sevai: Math.floor(Math.random() * 12) + 1,
        amsam_budhan: Math.floor(Math.random() * 12) + 1,
        amsam_viyazhan: Math.floor(Math.random() * 12) + 1,
        amsam_sukkiran: Math.floor(Math.random() * 12) + 1,
        amsam_sani: Math.floor(Math.random() * 12) + 1,
        amsam_rahu: Math.floor(Math.random() * 12) + 1,
        amsam_kethu: Math.floor(Math.random() * 12) + 1,
        amsam_lagnam: Math.floor(Math.random() * 12) + 1,
        // Photos
        photo: JSON.stringify(gender === "Male" ? ["boy_car.png"] : ["girl_flower.png"]),
      };
      users.push(user);
    }

    console.log(`Bulk inserting ${users.length} users...`);
    await UserDetail.bulkCreate(users);
    console.log("Success: 300 unique profiles created.");
  } catch (error) {
    console.error("Error generating data:", error);
  } finally {
    await sequelize.close();
  }
}

generateData();
