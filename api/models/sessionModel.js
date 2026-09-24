import mongoose from "mongoose";
import sessionSchema from "../../shared/sessionSchema.js";

const Session = mongoose.model("Sessions", sessionSchema);

export default Session;
