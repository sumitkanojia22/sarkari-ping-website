import Users from "../models/userModel.js";
import Session from "../models/sessionModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import hashToken from "../utils/hashToken.js";

export const userSignUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  //checking if user is Already exist
  const isAlreadyExist = await Users.findOne({ email });

  if (isAlreadyExist) {
    return next(new AppError("User Already exist", 409));
  }

  const newUser = await Users.create({ name, email, password });

  const refreshToken = jwt.sign(
    {
      id: newUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_JWT_EXPIRES,
    },
  );

  const refreshTokenHashed = hashToken(refreshToken);

  const session = await Session.create({
    user: newUser._id,
    refreshTokenHashed,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: newUser._id,
      sessionId: session._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_JWT_EXPIRES,
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //client side cant run javascript on it
    secure: true,
    sameSite: "strict",
    maxAge: process.env.REFRESH_JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000, //expire in days
  });

  res.status(201).json({
    status: "success",
    data: newUser,
    accessToken,
  });
});

export const userLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Invalid input or empty", 400));
  }

  const loginUser = await Users.findOne({ email }).select("+password");

  if (!loginUser) {
    return next(new AppError("Invalid Email or Password", 400));
  }

  const isValidPassword = await bcrypt.compare(password, loginUser.password);

  if (!isValidPassword) {
    return next(new AppError("Invalid Email or Password", 400));
  }

  const refreshToken = jwt.sign(
    {
      id: loginUser._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_JWT_EXPIRES,
    },
  );

  const refreshTokenHashed = hashToken(refreshToken);

  const session = await Session.create({
    user: loginUser._id,
    refreshTokenHashed,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = jwt.sign(
    {
      id: loginUser._id,
      sessionId: session._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_JWT_EXPIRES,
    },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //client side cant run javascript on it
    secure: true,
    sameSite: "strict",
    maxAge: process.env.REFRESH_JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000, //expire in days
  });

  res.status(201).json({
    status: "success",
    data: loginUser,
    accessToken,
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return next(new AppError("Token not found", 401));
  }

  //getting token from header
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return next(new AppError("Token not Found"));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await Users.findById(decoded.id);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Refresh token is not found", 401));
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new AppError("Refresh token is not found", 401));
  }

  const refreshTokenHashed = hashToken(refreshToken);

  const session = await Session.findOne({
    refreshTokenHashed,
    revoked: false,
  });

  if (!session) {
    return next(new AppError("Invalid Token", 401));
  }

  const newAccessToken = jwt.sign(
    {
      id: decoded.id,
      sessionId: session._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_JWT_EXPIRES,
    },
  );

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_JWT_EXPIRES,
    },
  );

  const newRefreshTokenHashed = hashToken(newRefreshToken);
  session.refreshTokenHashed = newRefreshTokenHashed;
  await session.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: process.env.REFRESH_JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    newAccessToken,
  });
});

export const userLogout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Refresh Token not found", 400));
  }

  const refreshTokenHashed = hashToken(refreshToken);

  const session = await Session.findOne({
    refreshTokenHashed,
    revoked: false,
  });

  if (!session) {
    return next(new AppError("Session not found", 400));
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Logout successfully",
  });
});

export const userLogoutAllSession = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Refresh token is not found", 401));
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

  const session = await Session.updateMany(
    { user: decoded.id, revoked: false },
    { revoked: true },
  );

  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Logout from all devices",
  });
});
