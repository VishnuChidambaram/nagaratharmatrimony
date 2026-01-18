import sequelize from "./config/database.js";

import fs from 'fs';

async function checkSchema() {
  try {
    const [results] = await sequelize.query("DESCRIBE admin_login");
    const fields = results.map(r => r.Field);
    fs.writeFileSync('admin_schema.json', JSON.stringify(fields, null, 2));
    console.log("Schema written to admin_schema.json");
    process.exit(0);
  } catch (error) {
    console.error("Error describing table:", error);
    process.exit(1);
  }
}

checkSchema();
