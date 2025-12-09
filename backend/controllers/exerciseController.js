const Exercise = require('../models/exercise');
const CustomError = require('../errorHandlers/customError');

// GET all user exercises
const getExercisesByEmail = async (req, res, next) => {
  try {
    const email = req.user.email;
    const data = await Exercise.find({ userEmail: email });
    res.json(data);
  } catch (e) {
    next(new CustomError(e.message, 500));
  }
};

// GET by painDataId
const getExerciseByEmailAndPainId = async (req, res, next) => {
  try {
    const { painDataId } = req.params;
    const email = req.user.email;
    const data = await Exercise.findOne({ userEmail: email, painDataId });
    if (!data) return next(new CustomError("Not found", 404));
    res.json(data);
  } catch (e) {
    next(new CustomError(e.message, 500));
  }
};

// GET by document id
const getExerciseById = async (req, res, next) => {
  try {
    const data = await Exercise.findById(req.params.id);
    if (!data) return next(new CustomError("Not found", 404));
    res.json(data);
  } catch (e) {
    next(new CustomError(e.message, 500));
  }
};

// ✅ your AI creator stays as-is
const createExercise = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const painDataId = req.user.painDataId;
    const ai = req.aiPayload;

    if (!ai || !ai.plan) {
      return next(new CustomError('No AI plan received', 400));
    }

    const formattedExercises = ai.plan.exercises.map(ex => ({
      exerciseName: ex.name,
      reps: ex.reps,
      sets: ex.sets,
      frequency: ex.frequency,
      precautions: ex.precautions,
      description: ex.description
    }));

    const exerciseDoc = new Exercise({
      userEmail,
      painDataId,
      aiSummary: ai.plan.summary,
      exercises: formattedExercises
    });

    const savedExercise = await exerciseDoc.save();

    res.status(201).json({
      message: 'AI Exercise plan created',
      exercise: savedExercise
    });

  } catch (error) {
    next(new CustomError(error.message, 500));
  }
};

module.exports = {
  createExercise,
  getExercisesByEmail,
  getExerciseByEmailAndPainId,
  getExerciseById
};
