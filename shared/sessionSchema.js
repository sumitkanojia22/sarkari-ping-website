import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User is Required"],
    },

    refreshTokenHashed: {
      type: String,
      required: [true, "Refresh Token is required"],
    },
    ip: {
      type: "String",
      required: [true, "IP address is required"],
    },

    //userAgent to store the User using type of Browers and version of Browers.
    userAgent: {
      type: String,
      required: [true, "User Agent is required"],
    },
    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default sessionSchema;
