import express from "express";
import {
  createUser,
  deleteUser,
  getAllUser,
  getUserById,
  getMyJobs,
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
import { getJobById, getLatestJobs, getRecommendations, recordEvent } from "../controllers/jobController.js";
import { dashboard, getPreferences, resetPreferences, toggleSaveJob, updatePreferences } from "../controllers/platformController.js";

const userRoutes = express.Router();

userRoutes.route("/auth/signup").post(userSignUp);
userRoutes.route("/auth/login").post(userLogin);
userRoutes.route("/auth/logout").post(userLogout);
userRoutes.route("/auth/logout-all").post(userLogoutAllSession);
userRoutes.route("/auth/get-me").get(protect, getMe);
userRoutes.route("/auth/refresh-token").post(handleRefreshToken);
userRoutes.route("/jobs").get(protect, getLatestJobs);
userRoutes.route("/jobs/:id").get(protect, getJobById);
userRoutes.route("/recommendations").get(protect, getRecommendations);
userRoutes.route("/events").post(protect, recordEvent);
userRoutes.route("/preferences").get(protect, getPreferences).patch(protect, updatePreferences).post(protect, updatePreferences).delete(protect, resetPreferences);
userRoutes.route("/jobs/:jobId/save").post(protect, toggleSaveJob);
userRoutes.route("/dashboard").get(protect, dashboard);

// Accounts can only be read, changed, or deleted by their owner. Administrative
// user management should live in separately authorised routes when it is needed.
userRoutes
  .route("/me")
  .get(protect, getMe)
  .patch(protect, updateUser)
  .delete(protect, deleteUser);
userRoutes.route("/me/jobs").get(protect, getMyJobs);

export default userRoutes;
