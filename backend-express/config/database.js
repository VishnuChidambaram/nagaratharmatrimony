import { Sequelize } from "sequelize";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isLocalhost = process.env.DB_HOST === "localhost" || process.env.DB_HOST === "127.0.0.1";

const sslConfig = isLocalhost ? false : {
  require: true,
  rejectUnauthorized: false
};

if (!isLocalhost) {
  // Use path relative to this file's directory (config/database.js)
  // Certificate should now be in backend-express/isrgrootx1.pem
  const caCertPath = path.join(__dirname, "../isrgrootx1.pem");
  if (fs.existsSync(caCertPath)) {
    console.log("Database: Found SSL CA certificate at", caCertPath);
    sslConfig.ca = fs.readFileSync(caCertPath);
  } else {
    console.warn("Database: SSL CA certificate NOT found at", caCertPath);
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    define: {
      timestamps: false,
    },
    logging: false, // Set to console.log for debugging
    dialectOptions: {
      ssl: sslConfig
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;
