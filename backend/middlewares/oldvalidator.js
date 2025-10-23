const axios = require('axios');

async function AI_PainDataValidator(req, res, next) {
  try {
    const aiResponse = await axios.post(
      `${process.env.AI_URI}/ai/validate`,
      {
        userId: req.user._id,
        injuryPlace: req.body.injuryPlace,
        painType: req.body.painType,
        painLevel: req.body.painLevel,
        description: req.body.description,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const { valid, duplicate, message } = aiResponse.data;

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: message || 'Not valid data',
      });
    }

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: message || 'Duplicate data',
      });
    }

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



// const PainData = require('../models/painData');
// const Exercise = require('../models/exercise');
// const CustomError = require('../errorHandlers/customError');
// const axios = require('axios');

// /**
//  * Middleware to validate AI pain data before saving
//  */
// async function aiPainDataCheck(req, res, next) {
//     try {
//         console.log("inside ai check", req.body)

//         const { injuryPlace, description, painType, painLevel, userId } = req.body;

//         // 1️⃣ Validate injuryPlace
//         const validBodyParts = [
//             'knee', 'shoulder', 'back', 'neck', 'ankle', 'elbow',
//             'wrist', 'hip', 'leg', 'arm', 'foot'
//         ];
//         if (!validBodyParts.includes(injuryPlace?.toLowerCase())) {
//             return next(new CustomError('Invalid human body part', 400));
//         }

//         // 2️⃣ Validate description — should form meaningful English
//         if (!description || description.trim().length < 5) {
//             return next(new CustomError('Description too short or meaningless', 400));
//         }

//         // Optionally call an AI API for semantic validation (optional)
//         // Example:
//         // const aiCheck = await axios.post(`${process.env.AI_URI}/validate`, { description });
//         // if (!aiCheck.data.meaningful) {
//         //   return next(new CustomError('Description does not make sense', 400));
//         // }

//         // 3️⃣ Check previous pain data for same user + body part
//         const pastPainData = await PainData.find({ userId, injuryPlace });

//         for (const data of pastPainData) {
//             const sameType = data.painType?.toLowerCase() === painType?.toLowerCase();
//             const levelClose = Math.abs(data.painLevel - painLevel) <= 2;

//             if (sameType || levelClose) {
//                 console.log("sametype", sameType || levelClose)
//                 const createdBefore7Days =
//                     (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24) > 7;

//                 if (createdBefore7Days) {
//                     const exercise = await Exercise.findOne({ painDataId: data._id });

//                     if (exercise && exercise.progress < 90) {
//                         return next(
//                             new CustomError(
//                                 'Previous exercise not yet completed. Please complete before adding new data.',
//                                 400
//                             )
//                         );
//                     }
//                 }
//             }
//         }

//         // ✅ If all checks passed
//         next();
//     } catch (error) {
//         console.error('aiPainDataCheck error:', error);
//         next(new CustomError('Error validating pain data', 500));
//     }
// }

// module.exports = aiPainDataCheck;