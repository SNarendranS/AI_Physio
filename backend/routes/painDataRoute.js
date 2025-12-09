const express = require('express');
const {
  getByUserId,
  getByUserEmail,
  postByUserEmailWithNext
} = require('../controllers/painDataController');

const authorizeMiddleware = require('../middlewares/authorize');
const { createExercise } = require('../controllers/exerciseController');

const router = express.Router();

// Routes
router.get('/:userId', authorizeMiddleware, getByUserId);
router.get('/', authorizeMiddleware, getByUserEmail);

// ✅ AI pipeline route (NO image uploads anymore)
router.post(
  '/exercise',
  authorizeMiddleware,
  postByUserEmailWithNext,
  createExercise
);

module.exports = router;