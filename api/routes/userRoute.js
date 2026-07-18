import express from "express";
import {
  createUser,
  deleteUser,
  getAllUser,
  getUserById,
  updateUser,
} from "../controllers/userController.js";

const userRoutes = express.Router();

userRoutes.route("/").get(getAllUser).post(createUser);

userRoutes.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default userRoutes;
