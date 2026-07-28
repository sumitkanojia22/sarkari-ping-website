import express, { json } from "express";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import cors from "cors";
import helmet from "helmet";

import userRoutes from "./routes/userRoute.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());

app.use(helmet());

app.use(express.json());

app.use(cookieParser());

//routes
app.use("/api/v1/users", userRoutes);

//Handling Unhandle routes.
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find route in ${req.originalUrl} from th API`, 404));
});

app.use(globalErrorHandler);

export default app;
