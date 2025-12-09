const express = require('express');
const router = express.Router();
const authorizeMiddleware = require('../middlewares/authorize');
const exerciseController = require('../controllers/exerciseController');

router.get('/', authorizeMiddleware, exerciseController.getExercisesByEmail);
router.get('/painData/:painDataId', authorizeMiddleware, exerciseController.getExerciseByEmailAndPainId);
router.get('/id/:id', authorizeMiddleware, exerciseController.getExerciseById);
router.post('/', authorizeMiddleware, exerciseController.createExercise);

module.exports = router;
