import mongoose from "mongoose";

import dotenv from "dotenv";

import app from "./app.js";

process.on("uncaughtException", (err) => {
  console.log(`Error name: ${err.name}, Error message: ${err.message}`);
  console.log("Uncaught Exception, shutting down...");

  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 8080;

const environment = process.env.NODE_ENV || "production";
const requiredEnvironment = ["DATABASE", "DB_PASSWORD", "JWT_SECRET", "ACCESS_JWT_EXPIRES", "REFRESH_JWT_EXPIRES"];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);

if (missingEnvironment.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(", ")}`);
}

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("DATABASE IS CONNECT SUCCESSFULLY");
});

const server = app.listen(port, () => {
  console.log(`LISTENING ON PORT:${port}`);
  console.log(`ENVIRONMENT: ${environment}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log(`Error name: ${err.name}, Error message: ${err.message}`);
  console.log("unhandled rejection, shutting down...");

  server.close(() => {
    process.exit(1);
  });
});
