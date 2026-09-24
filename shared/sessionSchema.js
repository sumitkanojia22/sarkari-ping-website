import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
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
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  },
);

export default sessionSchema;
