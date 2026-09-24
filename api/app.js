import express from "express";
import dotenv from "dotenv";
import AppError from "./utils/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/userRoute.js";
import cookieParser from "cookie-parser";

dotenv.config({ path: "./config.env" });

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new AppError("Origin is not allowed by CORS", 403));
    },
    credentials: true,
  }),
);

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
