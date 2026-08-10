import express from "express";
import {
  createUser,
  deleteUser,
  getAllUser,
  getUserById,
  updateUser,
} from "../controllers/userController.js";
import {
  getMe,
  handleRefreshToken,
  protect,
  userLogin,
  userLogout,
  userLogoutAllSession,
  userSignUp,
} from "../controllers/authController.js";

const userRoutes = express.Router();

userRoutes.route("/auth/signup").post(userSignUp);
userRoutes.route("/auth/login").post(userLogin);
userRoutes.route("/auth/logout").get(userLogout);
userRoutes.route("/auth/logout-all").get(userLogoutAllSession);
userRoutes.route("/auth/get-me").get(protect, getMe);
userRoutes.route("/auth/refresh-token").get(handleRefreshToken);

userRoutes.route("/").get(getAllUser).post(createUser);

userRoutes.route("/:id").get(getUserById).patch(updateUser).delete(deleteUser);

export default userRoutes;
