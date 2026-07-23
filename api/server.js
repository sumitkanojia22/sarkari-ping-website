import mongoose from "mongoose";

import dotenv from "dotenv";

import app from "./app.js";

dotenv.config({ path: "./config.env" });

const port = process.env.PORT || 8080;

const enivornment = process.env.NODE_ENV;

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose.connect(DB).then(() => {
  console.log("DATABASE IS CONNECT SUCCESSFULLY");
});

app.listen(port, () => {
  console.log(`LISTENING ON PORT:${port}`);
  console.log(`ENIVORNMENT: ${enivornment}`);
});
