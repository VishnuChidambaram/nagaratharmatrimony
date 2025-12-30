import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";

const AdminLogin = sequelize.define(
  "AdminLogin",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING(255),
      unique: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
      onUpdate: Sequelize.NOW,
    },
    sessionId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "admin_login",
  }
);

export default AdminLogin;
