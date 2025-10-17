const PainData = require('../models/painData');
const User = require('../models/user');

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
    const  email  = req.user.email;
    const user = await User.findOne({ email:email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const painData = await PainData.find({ userId: user._id });
    if (!painData.length) return res.status(404).json({ message: 'No records found' });
    res.status(200).json(painData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📍 Post pain data by user ID
exports.postByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { injuryPlace, painType, painLevel, description } = req.body;
    const doctorSlip = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      : undefined;

    const newPainData = new PainData({
      userId,
      injuryPlace,
      painType,
      painLevel,
      description,
      doctorSlip
    });

    await newPainData.save();
    res.status(201).json({ message: 'Pain data saved successfully', data: newPainData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📍 Post pain data by user Email
exports.postByUserEmail = async (req, res) => {
  try {
    const  email  = req.user.email;
    const user = await User.findOne({ email:email });
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
      injuryPlace,
      painType,
      painLevel,
      description,
      doctorSlip
    });

    await newPainData.save();
    res.status(201).json({ message: 'Pain data saved successfully', data: newPainData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
