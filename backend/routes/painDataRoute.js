const express = require('express');
const multer = require('multer');
const { getByUserId, getByUserEmail, postByUserId, postByUserEmail, postByUserEmailWithNext } = require('../controllers/painDataController');
const authorizeMiddleware = require('../middlewares/authorize');
const AI_PainDataValidator = require('../middlewares/painDataValidator');
const { createExercise } = require('../controllers/exerciseController');
const router = express.Router();

// Memory storage for image uploads (binary in DB)
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadNone = multer(); // no storage, just parses body

// Routes
router.get('/:userId', authorizeMiddleware, getByUserId);
router.get('/', authorizeMiddleware, getByUserEmail);
router.post('/userId', authorizeMiddleware, upload.single('doctorSlip'), AI_PainDataValidator, postByUserId);
router.post('/', authorizeMiddleware, upload.single('doctorSlip'), AI_PainDataValidator, postByUserEmail);
router.post('/exercise', authorizeMiddleware, upload.single('doctorSlip'), AI_PainDataValidator, postByUserEmailWithNext, createExercise);


module.exports = router;
