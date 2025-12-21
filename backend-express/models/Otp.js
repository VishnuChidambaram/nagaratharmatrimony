import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";

const Otp = sequelize.define("Otp", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  identifier: {
    type: Sequelize.STRING(255),
    allowNull: false,
    comment: "Email",
  },
  type: {
    type: Sequelize.STRING(50),
    allowNull: false,
    comment: "e.g., 'phone_verification', 'password_reset'",
  },
  otp: {
    type: Sequelize.STRING(10),
    allowNull: false,
  },
  expiration: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

export default Otp;
