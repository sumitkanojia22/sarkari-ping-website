import AppError from "./../utils/appError.js";

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  return new AppError(
    `Duplicate field value: ${value}, Please use another Value`,
    400,
  );
};

const handleValidationErrorEB = (err) => {
  const errors = Object.values(err.errors).map((err) => err.message);

  return new AppError(
    `Invalid or Empty value : ${errors.join(". ")} , Please use Vaild Input`,
    400,
  );
};

// FIX: new — jwt.verify() throws JsonWebTokenError (bad signature/malformed)
// or TokenExpiredError (expired) rather than returning null. Without these,
// every expired refresh/access token fell through to the generic 500 branch
// below, so the frontend could never tell "token expired, please refresh"
// apart from "the server broke."
const handleJWTError = () =>
  new AppError("Invalid token, please log in again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired, please log in again", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //for operational error , showing detail to user
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  //for server side or database side error, not showing detail to user
  else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    // FIX: apply the same JWT translation in dev too, so local testing sees
    // the same 401 behavior production will have, instead of masking it
    // with the full stack trace only in prod.
    let error = err;
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;

    //Cast error for wrong type of id or value
    if (error.name === "CastError") error = handleCastErrorDB(error);

    //Duplicate field
    if (error.code === 11000) error = handleDuplicateFieldDB(error);

    //Validation error
    if (error.name === "ValidationError")
      error = handleValidationErrorEB(error);

    //FIX: JWT errors
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
