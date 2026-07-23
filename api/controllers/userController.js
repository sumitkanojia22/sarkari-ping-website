import Users from "../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

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
  const updatedUser = await Users.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const deletedUser = await Users.findByIdAndDelete(req.params.id);

  if (!deletedUser) {
    return next(
      new AppError(`Can't delete user ID,  please use valid user ID `, 404),
    );
  }

  res.status(204).json({
    status: "success",
    data: deletedUser,
  });
});
