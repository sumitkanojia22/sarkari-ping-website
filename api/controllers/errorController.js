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
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;

    //Cast error for wrong type of id or value
    if (error.name === "CastError") error = handleCastErrorDB(error);

    //Duplicate field
    if (error.code === 11000) error = handleDuplicateFieldDB(error);

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
