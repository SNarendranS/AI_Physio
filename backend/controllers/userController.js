const User = require('../models/user');
const CustomError = require('../errorHandlers/customError');

// Get user by username (from req.body)
const getUser = async (req, res, next) => {
    try {
        const userReq = req.body.username;
        const userData = await User.findOne({ username: userReq });
        if (!userData) return next(new CustomError('User not available', 404));

        const { email, username, name, _id, phoneNumber } = userData;
        res.status(200).json({ email, username, name, _id, phoneNumber });
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
};

// Get user by ID (from req.params)
const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userData = await User.findById(id);
        if (!userData) return next(new CustomError('User not found', 404));

        const { email, username, name, profile } = userData;
        res.status(200).json({ email, username, name });
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
};

// Update user
const updateUser = async (req, res, next) => {
    try {
        const userDetail = req.body.user;
        const updateDetail = req.body.update;

        const result = await User.findOneAndUpdate(userDetail, updateDetail, { new: true });
        if (!result) return next(new CustomError('Cannot update… user does not exist', 400));

        res.status(200).json({ message: 'User updated successfully', result });
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
};

module.exports = { getUser, getUserById, updateUser };