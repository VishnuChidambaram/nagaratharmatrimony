import db from "../models/index.js";

async function checkUsers() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected successfully.");
    
    const totalCount = await db.UserDetail.count();
    console.log(`Total users: ${totalCount}`);
    
    const activeCount = await db.UserDetail.count({ where: { is_deleted: false } });
    console.log(`Active users: ${activeCount}`);
    
    const maleCount = await db.UserDetail.count({ where: { gender: "Male", is_deleted: false } });
    const femaleCount = await db.UserDetail.count({ where: { gender: "Female", is_deleted: false } });
    console.log(`Male: ${maleCount}, Female: ${femaleCount}`);
    
    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsers();
