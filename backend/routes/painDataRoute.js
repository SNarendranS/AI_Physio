const express = require('express');
const multer = require('multer');
const {
  getByUserId,
  getByUserEmail,
  postByUserId,
  postByUserEmail
} = require('../controllers/painDataController');
const authorizeMiddleware = require('../middlewares/authorize');


const router = express.Router();

// Memory storage for image uploads (binary in DB)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/:userId',authorizeMiddleware, getByUserId);
router.get('/',authorizeMiddleware, getByUserEmail);
router.post('/userId',authorizeMiddleware, upload.single('doctorSlip'), postByUserId);
router.post('/',authorizeMiddleware, upload.single('doctorSlip'), postByUserEmail);

module.exports = router;
