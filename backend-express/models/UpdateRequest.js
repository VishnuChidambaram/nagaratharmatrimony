import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const UpdateRequest = sequelize.define('UpdateRequest', {
    request_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    original_data: {
      type: DataTypes.JSON,
      allowNull: false
    },
    new_data: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'update_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return UpdateRequest;
};
