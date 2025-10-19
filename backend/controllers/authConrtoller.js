const User = require('../models/user');
const jwt = require('jsonwebtoken');
const CustomError = require('../errorHandlers/customError');
const { isEmailVerified } = require('./emailController');

const register = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!isEmailVerified(email)) {
      throw new Error("Email OTP not verified!");
    }

    const user = await User.create(req.body);
    const token = jwt.sign(
      { email: user.email, username: user.username, name: user.name },
      process.env.JSON_SECRETKEY,
      { expiresIn: '1h' }
    );

    // Remove email from verified set so they must re-verify next time
    // verifiedEmails.delete(email);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user
    });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new CustomError('Invalid email!', 401));

    const isPasswordValid = await user.comparePassword(req.body.password);
    if (!isPasswordValid) return next(new CustomError('Invalid password! Retry.', 401));

    const { email, username, role, name } = user;
    const token = jwt.sign({ email, username, role, name }, process.env.JSON_SECRETKEY, { expiresIn: '7d' });

    res.status(200).json({ token });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

module.exports = { register, login };
