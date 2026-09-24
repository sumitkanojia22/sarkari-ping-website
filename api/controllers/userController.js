import Users from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import Session from "../models/sessionModel.js";
import "../models/jobModel.js";
import { getRefreshTokenCookieOptions } from "../utils/cookieOptions.js";

export const getAllUser = catchAsync(async (req, res, next) => {
  const users = await Users.find();
  res.status(200).json({
    status: "success",
    data: users,
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const userById = await Users.findById(req.params.id);

  if (!userById) {
    return next(
      new AppError(`Can't find user ID,  please use valid user ID `, 404),
    );
  }

  res.status(200).json({
    status: "success",
    data: userById,
  });
});

export const createUser = catchAsync(async (req, res, next) => {
  const newUser = await Users.create(req.body);

  res.status(201).json({
    status: "success",
    data: newUser,
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const allowedFields = ["name", "email", "password", "preferences"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  if (Object.keys(updates).length === 0) {
    return next(new AppError("Provide a name, email, or password to update", 400));
  }

  const updatedUser = await Users.findById(req.user._id).select("+password");
  Object.assign(updatedUser, updates);
  await updatedUser.save();
  updatedUser.password = undefined;
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await Users.findByIdAndDelete(req.user._id);

  if (!deletedUser) {
    return next(
      new AppError(`Can't delete user ID,  please use valid user ID `, 404),
    );
  }

  await Session.updateMany({ user: req.user._id }, { revoked: true });

  res.clearCookie("refreshToken", getRefreshTokenCookieOptions());
  res.status(204).send();
});

export const getMyJobs = catchAsync(async (req, res) => {
  const user = await Users.findById(req.user._id)
    .populate({
      path: "preferences.savedJobs",
      options: { sort: { lastSeenAt: -1 } },
    })
    .select("name email preferences");

  res.status(200).json({ status: "success", results: user.preferences.savedJobs.length, data: user.preferences.savedJobs });
});
