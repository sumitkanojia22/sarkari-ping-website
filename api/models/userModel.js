import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userSchema from "../../shared/userSchema.js";

//Encrypt Password Middleware
userSchema.pre("save", async function () {
  //Only run this function when password is isModified
  if (!this.isModified("password")) return;

  //Hash the password the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
});

const Users = mongoose.model("Users", userSchema);

export default Users;
