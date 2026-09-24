import mongoose from "mongoose";
import jobSchema from "../../shared/jobSchema.js";

const Job = mongoose.models.Jobs || mongoose.model("Jobs", jobSchema);

export default Job;
