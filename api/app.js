import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./routes/userRoute.js";

const app = express();

app.use(cors());

app.use(helmet());

app.use(express.json());

app.use("/api/v1/users", userRoutes);

export default app;
