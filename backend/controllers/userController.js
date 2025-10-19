const User = require('../models/user');
const CustomError = require('../errorHandlers/customError');

// Get user by username (from req.user.email)
const getUser = async (req, res, next) => {
  try {
    const userReq = req.user.email;
    const userData = await User.findOne({ email: userReq });
    if (!userData) return next(new CustomError('User not available', 404));

    const { email, username, name, _id, phoneNumber, profile } = userData;
    res.status(200).json({ email, username, name, _id, phoneNumber, profile });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userData = await User.findById(id);
    if (!userData) return next(new CustomError('User not found', 404));

    const { email, username, name, profile } = userData;
    res.status(200).json({ email, username, name, profile });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

// Update user (including profile image)
const updateUser = async (req, res, next) => {
  try {
    // ✅ req.user is added by authorizeMiddleware
    const email = req.user?.email;
    if (!email) return next(new CustomError("Unauthorized user", 401));

    const { name, username } = req.body;

    const updateDetail = {};
    if (name) updateDetail.name = name;
    if (username) updateDetail.username = username;

    // ✅ Handle uploaded image if present
    if (req.file) {
      updateDetail.profile = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    // ✅ Find and update user
    const result = await User.findOneAndUpdate(
      { email },
      updateDetail,
      { new: true }
    );

    if (!result) return next(new CustomError("User not found", 404));

    res.status(200).json({
      message: "User updated successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    next(new CustomError(error.message, 500));
  }
};


module.exports = { getUser, getUserById, updateUser };