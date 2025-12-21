import sequelize from "../config/database.js";
import UserDetail from "./UserDetail.js";
import Otp from "./Otp.js";
import AdminLogin from "./AdminLogin.js";
import UpdateRequestModel from "./UpdateRequest.js";
import NotificationModel from "./Notification.js";

const db = {
  sequelize,
  UserDetail,
  Otp,
  AdminLogin,
  UpdateRequest: UpdateRequestModel(sequelize),
  Notification: NotificationModel(sequelize),
};

export default db;
