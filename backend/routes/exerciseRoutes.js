const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getAllExercises,
    getExercisesByEmail,
    getExerciseByEmailAndPainId,
    getExerciseById,
    createExercise
} = require('../controllers/exerciseController');
const authorizeMiddleware = require('../middlewares/authorize');

// Memory storage for binary uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/all', authorizeMiddleware, getAllExercises); // Get all exercises
router.get('/', authorizeMiddleware, getExercisesByEmail); // Get all exercises for a user
router.get("/painData/:painDataId", authorizeMiddleware, getExerciseByEmailAndPainId);
router.get("/id/:id", authorizeMiddleware, getExerciseById);


router.post('/',authorizeMiddleware, upload.single('image'), createExercise); // Create one exercise

module.exports = router;
