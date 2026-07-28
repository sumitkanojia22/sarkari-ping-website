import mongoose from "mongoose";
import validator from "validator";

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
    maxlength: 40,
    select: false,
  },
});

export default userSchema;
