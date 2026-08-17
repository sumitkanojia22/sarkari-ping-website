import Users from "../models/userModel.js";
import Session from "../models/sessionModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import hashToken from "../utils/hashToken.js";

// FIX: new — secure:true requires HTTPS. On http://localhost in dev, browsers
// silently refuse to store/send the cookie, so refreshAccessToken() on
// reload always came back 401 and the session never persisted. sameSite:
// "strict" is also often stricter than needed for local dev. Both now flex
// based on NODE_ENV instead of being hardcoded for production only.
const isProd = process.env.NODE_ENV === "production";
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "strict" : "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000, //expire in days
  // maxAge: 5000, //expire in days
};

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

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  // newUser still carries the bcrypt-hashed password in memory even though
  // the schema marks it select:false (that only hides it on *queries*, not on
  // a freshly created document). Strip it before it goes out in the response.
  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    data: { newUser, accessToken },
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

  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  // we explicitly .select("+password") above to compare it — strip it
  // back out before sending loginUser to the client.
  loginUser.password = undefined;

  res.status(201).json({
    status: "success",
    data: { loginUser, accessToken },
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({
    status: "success",
    data: user,
  });
});

// renamed from `refreshToken` — it was shadowed by the local
// `const refreshToken` variable in every handler in this file (including
// this one). Route file must import this as `handleRefreshToken`.
export const handleRefreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new AppError("Refresh token is not found", 401));
  }

  // jwt.verify() THROWS on an invalid/expired token, it never returns
  // null/undefined. The throw bubbles up through catchAsync to
  // globalErrorHandler, which converts it into a proper 401.
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

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

  res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

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

  await Session.updateMany(
    { user: decoded.id, revoked: false },
    { revoked: true },
  );

  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Logout from all devices",
  });
});

export const protect = catchAsync(async (req, res, next) => {
  // const refreshToken = req.cookies.refreshToken;

  // if (!refreshToken) {
  //   return next(new AppError("Refresh token is not found or expires", 401));
  // }

  // // jwt.verify throws rather than returning falsy; errorController.js
  // // turns the throw into a 401.
  // jwt.verify(refreshToken, process.env.JWT_SECRET);

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return next(new AppError("Token not found", 401));
  }

  //getting token from header
  const accessToken = req.headers.authorization.split(" ")[1];

  if (!accessToken) {
    return next(new AppError("Token not Found", 401));
  }

  const accessDecoded = jwt.verify(accessToken, process.env.JWT_SECRET);

  // protect now also checks whether the session tied to this access token
  // has been revoked (e.g. via userLogout), instead of only checking the
  // JWT's own signature/expiry. Otherwise a still-unexpired access token
  // keeps working after logout until it naturally expires.
  const session = await Session.findById(accessDecoded.sessionId);

  if (!session || session.revoked) {
    return next(
      new AppError("Session has been revoked, please log in again", 401),
    );
  }

  const user = await Users.findById(accessDecoded.id);

  if (!user) {
    return next(new AppError("User no longer exists", 404));
  }

  req.user = user;
  next();
});
