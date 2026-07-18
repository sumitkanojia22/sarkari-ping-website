import mongoose from "mongoose";
import userSchema from "../../shared/userSchema.js";

const Users = mongoose.model("Users", userSchema);

export default Users;
