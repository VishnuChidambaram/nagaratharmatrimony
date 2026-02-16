import db from "../models/index.js";

async function checkCount() {
  try {
    await db.sequelize.authenticate();
    console.log("DB Connected.");
    
    // Check total count
    const total = await db.UserDetail.count();
    console.log(`Total UserDetails: ${total}`);

    // Check active count
    const active = await db.UserDetail.count({ where: { is_deleted: false } });
    console.log(`Active UserDetails: ${active}`);

    // Check specific user
    const specificEmail = "vishnuhero2001@gmail.com";
    const user = await db.UserDetail.findOne({ where: { email: specificEmail } });
    if (user) {
        console.log(`User ${specificEmail} FOUND.`);
        console.log(` - Gender: ${user.gender}`);
        console.log(` - IsDeleted: ${user.is_deleted}`);
        console.log(` - Temple: ${user.yourTemple}`);
    } else {
        console.log(`User ${specificEmail} NOT FOUND.`);
    }

    // Check gender distribution of active users
    const males = await db.UserDetail.count({ where: { is_deleted: false, gender: "Male" } });
    const females = await db.UserDetail.count({ where: { is_deleted: false, gender: "Female" } });
    console.log(`Active Males: ${males}`);
    console.log(`Active Females: ${females}`);

  } catch (error) {
    console.error("DB Check Failed:", error);
  } finally {
    process.exit(0);
  }
}

checkCount();
