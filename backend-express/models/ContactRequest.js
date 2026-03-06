import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ContactRequest = sequelize.define(
    "ContactRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      requester_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: "Email of the user sending the contact request",
      },
      target_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "user_id of the profile being requested",
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      tableName: "contact_requests",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return ContactRequest;
};
