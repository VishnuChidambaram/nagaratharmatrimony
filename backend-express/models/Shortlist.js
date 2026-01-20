import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";

const Shortlist = sequelize.define(
  "Shortlist",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'The user who is shortlisting',
    },
    shortlisted_user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'The profile being shortlisted',
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "shortlists",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_email', 'shortlisted_user_id']
      }
    ]
  }
);

export default Shortlist;
