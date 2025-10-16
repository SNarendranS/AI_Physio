let otpStore = {};           // { email: { otp, expiresAt } }
let verifiedEmails = new Set();  // store verified emails

const nodemailer = require('nodemailer');
require('dotenv').config(); // make sure .env is loaded

const transporter = nodemailer.createTransport({
  service: 'gmail', // or any SMTP service
  auth: {
    user: process.env.EMAIL_USER,    // your Gmail/SMTP email
    pass: process.env.EMAIL_PASS// app password (not your normal Gmail password)
  }
});

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  otpStore[email] = { otp, expiresAt };

  // send email logic
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP is ${otp} (expires in 5 minutes)`
  });

  res.status(200).json({ message: `OTP ${otp} sent to ${email}` });
};

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) {
    return res.status(400).json({ message: "No OTP sent to this email" });
  }

  const { otp: storedOtp, expiresAt } = otpStore[email];

  if (Date.now() > expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  if (storedOtp.toString() === otp.toString()) {
    verifiedEmails.add(email);
    delete otpStore[email];
    return res.status(200).json({ message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ message: "Invalid OTP" });
  }
};

exports.isEmailVerified = (email) => {
  return verifiedEmails.has(email);
};
