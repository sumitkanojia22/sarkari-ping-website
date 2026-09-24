import mongoose from "mongoose";
import schema from "../../shared/userJobEventSchema.js";
export default mongoose.models.UserJobEvents || mongoose.model("UserJobEvents", schema);
