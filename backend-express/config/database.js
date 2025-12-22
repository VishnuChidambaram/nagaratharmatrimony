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
  const caCertPath = path.join(__dirname, "../../isrgrootx1.pem");
  if (fs.existsSync(caCertPath)) {
    sslConfig.ca = fs.readFileSync(caCertPath);
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
    logging: console.log,
    dialectOptions: {
      ssl: sslConfig
    }
  }
);

export default sequelize;
