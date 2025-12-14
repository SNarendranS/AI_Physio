const PainData = require('../models/painData');
const User = require('../models/user');
const axios = require('axios');
const CustomError = require('../errorHandlers/customError');

// 🔗 FASTAPI URL
const AI_URL = process.env.AI_URI || 'http://127.0.0.1:8000/assess';

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

// 📍 Get pain data by Email
exports.getByUserEmail = async (req, res) => {
  try {
    const email = req.user.email;
    const painData = await PainData.find({ userEmail: email });
    if (!painData.length) return res.status(404).json({ message: 'No records found' });
    res.status(200).json(painData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ CREATE PainData → Call AI → Attach AI fields
exports.postByUserEmailWithNext = async (req, res, next) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) return next(new CustomError('User not found', 401));

    const {
      chiefComplaint,
      painSeverity,
      history,
      goals,
      extraContext
    } = req.body;

    const newPainData = new PainData({
      userId: user._id,
      userEmail: email,
      chiefComplaint,
      painSeverity,
      history,
      goals,
      extraContext
    });

    const savedPainData = await newPainData.save();

    // 🔥 Call FastAPI AI
    const aiRes = await axios.post(process.env.AI_URI || 'http://127.0.0.1:8000/assess', {
      age: user.age || null,
      sex: user.gender || null,
      chief_complaint: chiefComplaint,
      pain_severity_0_10: painSeverity,
      history,
      goals,
      extra_context: extraContext,
      question_rounds: 0
    });

    const ai = aiRes.data;
    console.log(ai)
    // Save AI metadata
    savedPainData.aiSessionId = ai.session_id;
    savedPainData.aiTriage = ai.triage;
    savedPainData.aiReasons = ai.reasons;
    await savedPainData.save();

    req.user.painDataId = savedPainData._id;
    req.aiPayload = ai;

    next();
  } catch (err) {
    next(new CustomError(err.message, 500));
  }
};
