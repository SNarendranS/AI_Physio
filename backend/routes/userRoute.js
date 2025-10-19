const express = require('express');
const { getUser, getUserById, updateUser } = require('../controllers/userController');
const authorizeMiddleware = require('../middlewares/authorize');
const multer = require('multer');

const router = express.Router();

// Multer setup for profile image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post('/update', authorizeMiddleware, upload.single('profile'), updateUser);
router.get('/', authorizeMiddleware, getUser);
router.get('/:id',authorizeMiddleware, getUserById);

module.exports = router;
