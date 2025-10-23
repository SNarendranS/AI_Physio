const axios = require('axios');

async function AI_PainDataValidator(req, res, next) {
  try {
    // -------------------------------
    // 1️⃣ Validate injuryPlace & description
    // -------------------------------
    const validateResponse = await axios.post(
      `${process.env.AI_URI}/ai/validate`,
      {
        userId: req.user._id,
        userEmail: req.user.email,
        injuryPlace: req.body.injuryPlace,
        painType: req.body.painType,
        painLevel: req.body.painLevel,
        description: req.body.description,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!validateResponse.data.valid) {
      return res.status(400).json({
        success: false,
        message: validateResponse.data.message || 'Validation failed',
      });
    }

    // -------------------------------
    // 2️⃣ Check duplicates
    // -------------------------------
    const duplicateResponse = await axios.post(
      `${process.env.AI_URI}/ai/checkDuplicates`,
      {
        userId: req.user._id,
        userEmail: req.user.email,
        injuryPlace: req.body.injuryPlace,
        painType: req.body.painType,
        painLevel: req.body.painLevel,
        description: req.body.description,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (duplicateResponse.data.similarRecords?.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Similar pain record(s) exist',
        similarRecords: duplicateResponse.data.similarRecords,
      });
    }

    // All checks passed
    next();

  } catch (error) {
    // If backend responded with a status and message
    if (error.response && error.response.data) {
      const backendMessage =
        error.response.data.detail || error.response.data.message;
      const status = error.response.status || 400;

      console.error('❌ AI PainDataCheck backend error:', backendMessage);

      return res.status(status).json({
        success: false,
        message: backendMessage || 'Validation failed',
      });
    }

    // Fallback for network or unexpected errors
    console.error('❌ AI PainDataCheck network/error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

module.exports = AI_PainDataValidator;
