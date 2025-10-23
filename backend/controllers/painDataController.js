const PainData = require('../models/painData');
const User = require('../models/user');
const { createExercise } = require('./exerciseController');

// 📍 Get pain data by user ID
exports.getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const painData = await PainData.find({ userId });
    if (!painData.length) return res.status(404).json({ message: 'No records found' });
    res.status(200).json(painData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📍 Get pain data by user Email
exports.getByUserEmail = async (req, res) => {
  try {
    const email = req.user.email;
    // const user = await User.findOne({ email: email });
    // if (!user) return res.status(404).json({ message: 'User not found' });

    const painData = await PainData.find({ userEmail: email });
    if (!painData.length) return res.status(404).json({ message: 'No records found' });
    res.status(200).json(painData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📍 Post pain data by user ID


exports.postByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { injuryPlace, painType, painLevel, description } = req.body;
    const userEmail = req.user.email;

    const doctorSlip = req.file
      ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
      : undefined;

    const newPainData = new PainData({
      userId,
      userEmail,
      injuryPlace,
      painType,
      painLevel,
      description,
      doctorSlip
    });

    const savedPainData = await newPainData.save();

    res.status(201).json({ message: 'Pain data saved successfully', data: savedPainData });
  } catch (err) {
    next(err); // Use next to pass errors to middleware
  }
};


// 📍 Post pain data by user Email
exports.postByUserEmail = async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { injuryPlace, painType, painLevel, description } = req.body;
    const doctorSlip = req.file
      ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
      : undefined;

    const newPainData = new PainData({
      userId: user._id,
      userEmail: email,
      injuryPlace,
      painType,
      painLevel,
      description,
      doctorSlip
    });

    const savedPainData = await newPainData.save();
    res.status(201).json({ message: 'Pain data saved successfully', data: savedPainData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.postByUserEmailWithNext = async (req, res, next) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email: email });
    if (!user) return next(new CustomError('User not found', 401))

    const { injuryPlace, painType, painLevel, description } = req.body;
    const doctorSlip = req.file
      ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
      : undefined;

    const newPainData = new PainData({
      userId: user._id,
      userEmail: email,
      injuryPlace,
      painType,
      painLevel,
      description,
      doctorSlip
    });
    const savedPainData = await newPainData.save();
    req.user.painDataId = savedPainData._id;
    next()
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
