import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_API_URL;
// User registration
const register = (userDetails) => {
  return axios.post(`${API_URL}/auth/register`, userDetails);
};

// User login
const login = (user) => {
    console.log(API_URL)
  return axios.post(`${API_URL}/auth/login`, user);
};

// Send OTP
const sendOtp = (emailObj) => {
  return axios.post(`${API_URL}/email/send-otp`, emailObj); // call backend emailController
};

// Verify OTP
const verifyOtp = (otpObj) => {
  return axios.post(`${API_URL}/email/verify-otp`, otpObj);
};

const AuthService = {
  register,
  login,
  sendOtp,
  verifyOtp,
};

export default AuthService;
