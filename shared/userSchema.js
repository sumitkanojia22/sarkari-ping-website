import mongoose from "mongoose";
import validator from "validator";

const jobPreferenceSchema = new mongoose.Schema(
  {
    keywords: { type: [String], default: [] }, categories: { type: [String], default: [] }, organizations: { type: [String], default: [] }, departments: { type: [String], default: [] }, states: { type: [String], default: [] }, preferredLocations: { type: [String], default: [] }, jobTypes: { type: [String], default: [] }, qualifications: { type: [String], default: [] }, degrees: { type: [String], default: [] }, branches: { type: [String], default: [] }, governmentTypes: { type: [String], default: [] },
    minSalary: { type: Number, min: 0 }, onlyActiveJobs: { type: Boolean, default: true }, closingSoon: { type: Boolean, default: false }, highVacancy: { type: Boolean, default: false }, minimumMatchThreshold: { type: Number, default: 50, min: 0, max: 100 }, onboardingComplete: { type: Boolean, default: false },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jobs" }],
  },
  { _id: false },
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "A User name should be above 3 letter"],
    maxlength: [40, "A User name should be below 40 letter"],
  },

  email: {
    type: String,
    required: [true, "The User must have Email-id"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid Email-id"],
  },

  password: {
    type: String,
    required: [true, "The User must have Password"],
    minlength: 8,
    maxlength: 72,
    select: false,
  },
  preferences: { type: jobPreferenceSchema, default: () => ({}) },
});

export default userSchema;
