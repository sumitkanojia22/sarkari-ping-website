import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./routes/userRoute.js";

const app = express();

app.use(cors());

app.use(helmet());

app.use(express.json());

app.use("/api/v1/users", userRoutes);

//Handling Unhandle routes.
app.all(/.*/, (req, res) => {
  res.status(404).json({
    status: "failed",
    message: `Can't find route in ${req.originalUrl} from th API`,
  });
});

export default app;
