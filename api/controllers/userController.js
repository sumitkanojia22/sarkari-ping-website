import Users from "../models/userModel.js";

export const getAllUser = async (req, res) => {
  const users = await Users.find();

  res.status(200).json({
    status: "success",
    data: users,
  });
};
export const getUserById = async (req, res) => {
  const userById = await Users.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: userById,
  });
};
export const createUser = async (req, res) => {
  const newUser = await Users.create(req.body);

  res.status(201).json({
    status: "success",
    data: newUser,
  });
};
export const updateUser = async (req, res) => {
  const updatedUser = await Users.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
};
export const deleteUser = async (req, res) => {
  const deletedUser = await Users.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
    data: deletedUser,
  });
};
