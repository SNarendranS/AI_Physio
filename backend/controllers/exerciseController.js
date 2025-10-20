const Exercise = require('../models/exercise');
const PainData = require('../models/painData');
const axios = require('axios');
const CustomError = require('../errorHandlers/customError');
require('dotenv').config();

/**
 * 🧩 GET all exercises
 */
const getAllExercises = async (req, res, next) => {
  try {
    const exercises = await Exercise.find();
    res.status(200).json(exercises);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

/**
 * 🧠 GET all exercises by user email
 */
const getExercisesByEmail = async (req, res, next) => {
  try {
    const email = req.user.email;
    const exercises = await Exercise.find({ userEmail: email.toLowerCase() });
    if (!exercises.length) {
      return next(new CustomError('No exercises found for this user', 404));
    }
    res.status(200).json(exercises);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

/**
 * 🎯 GET unique exercise by userEmail + painDataId
 */
const getExerciseByEmailAndPainId = async (req, res, next) => {
  try {
    const { email } = req.user;
    const { painDataId } = req.params;
    const exercise = await Exercise.findOne({
      userEmail: email.toLowerCase(),
      painDataId
    });
    if (!exercise) {
      return next(new CustomError('Exercise not found for this user and pain data', 404));
    }
    res.status(200).json(exercise);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

/**
 * 🔍 GET exercise by ID
 */
const getExerciseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return next(new CustomError('Exercise not found for this id', 404));
    }
    res.status(200).json(exercise);
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

/**
 * 🤖 POST create exercise (supports multiple exercises)
 */
const createExercise = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const { painDataId } = req.body;

    if (!painDataId) {
      return next(new CustomError('painDataId is required', 400));
    }

    const painData = await PainData.findById(painDataId);
    if (!painData) {
      return next(new CustomError('PainData not found', 404));
    }

    // Call external AI service
    const response = await axios.post(`${process.env.AI_URI}/recommend`, painData, {
      headers: {
        'Authorization': 'Bearer ' + req.headers.authorization?.split(' ')[1], // optional
        'Content-Type': 'application/json'
      }
    });

    const { exercises, progress } = response.data;

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return next(new CustomError('Exercises array is required', 400));
    }

    const newExercise = new Exercise({
      userEmail,
      painDataId,
      exercises,
      progress: progress || 0
    });

    const savedExercise = await newExercise.save();

    res.status(201).json({
      message: 'Exercise created successfully',
      savedExercise
    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};


/**
 * 🔄 PATCH update completed sets of an inner exercise
 */
const updateExerciseProgress = async (req, res, next) => {
  try {
    const { id, exerciseIndex, completedSets } = req.body;

    const exerciseDoc = await Exercise.findById(id);
    if (!exerciseDoc) {
      return next(new CustomError('Exercise not found', 404));
    }

    if (exerciseIndex >= exerciseDoc.exercises.length) {
      return next(new CustomError('Invalid exercise index', 400));
    }

    exerciseDoc.exercises[exerciseIndex].completedSets = completedSets;

    await exerciseDoc.save(); // triggers pre-save hook to auto-update progress

    res.status(200).json({
      message: 'Exercise progress updated',
      progress: exerciseDoc.progress,
      updatedExercise: exerciseDoc
    });
  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

module.exports = {
  getAllExercises,
  getExercisesByEmail,
  getExerciseByEmailAndPainId,
  getExerciseById,
  createExercise,
  updateExerciseProgress
};
