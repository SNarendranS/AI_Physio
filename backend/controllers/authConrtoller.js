const User = require('../models/user');
const jwt = require('jsonwebtoken');
const CustomError = require('../errorHandlers/customError');

const register = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
};

const login = async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return next(new CustomError('Invalid username!', 401));

        const isPasswordValid = await user.comparePassword(req.body.password);
        if (!isPasswordValid) return next(new CustomError('Invalid password! Retry.', 401));

        const { email, username, role, name } = user;
        const token = jwt.sign({ email, username, role, name }, process.env.JSON_SECRETKEY, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        next(new CustomError(error.message, 500));
    }
};

module.exports = { register, login };