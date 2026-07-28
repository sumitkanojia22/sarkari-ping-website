import mongoose from "mongoose";
import bcrypt from "bcrypt";
import sessionSchema from "../../shared/sessionSchema.js";

const Session = mongoose.model("Sessions", sessionSchema);

export default Session;
