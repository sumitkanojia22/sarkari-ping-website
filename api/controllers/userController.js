import Users from "../models/userModel.js";

export const getAllUser = async (req, res) => {
  const users = await Users.find();

  res.status(200).json({
    status: "success",
    data: users,
  });
};
export const getUserById = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "This Route is not implemented",
  });
};
export const createUser = async (req, res) => {
  const newUser = await Users.create(req.body);

  res.status(201).json({
    status: "success",
    data: newUser,
  });
};
export const updateUser = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "This Route is not implemented",
  });
};
export const deleteUser = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "This Route is not implemented",
  });
};
