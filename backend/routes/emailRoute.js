const express = require('express')
const { sendOtp, verifyOtp } = require("../controllers/emailController");

const route = express.Router()

route.post('/send-otp', sendOtp)
route.post('/verify-otp', verifyOtp)

module.exports = route