import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Auth from '../../../services/authService'; // Auth.register, Auth.sendOtp, Auth.verifyOtp must exist
import './Register.css';

const Register = ({ AuthenticatedState }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phoneNumber: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const [auth, setAuth] = AuthenticatedState;
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOtp = async () => {
    if (!formData.email) {
      toast.error('Please enter a valid email to send OTP!');
      return;
    }
    try {
      await Auth.sendOtp({ email: formData.email });
      setOtpSent(true);
      toast.success(`OTP sent to ${formData.email}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      await Auth.verifyOtp({ email: formData.email, otp });
      setOtpVerified(true);
      toast.success('OTP verified successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Invalid OTP!');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error('Please verify your email OTP first!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      const response = await Auth.register(formData);
      localStorage.setItem('token', JSON.stringify(response.data.token));
      toast.success('Registration successful!');
      setAuth(true);

      setTimeout(() => {
        if (auth) {
          navigate('/exerciseList');
        }
      }, 700);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Registration failed!');
    }
  };

  return (
    <div className="register-container">
      <form className="register-box" onSubmit={handleRegister}>
        <h2>Create Account</h2>
        <p className="subtitle">Fill in your details to sign up</p>

        <div className="input-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={otpSent && !otpVerified}
            />
            {!otpVerified && (
              <button type="button" onClick={sendOtp} className="otp-btn">
                Send OTP
              </button>
            )}
          </div>
        </div>

        {otpSent && !otpVerified && (
          <div className="input-group">
            <label htmlFor="otp">Enter OTP</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                name="otp"
                id="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button
                type="button"
                className="otp-btn"
                onClick={verifyOtp}
              >
                Verify OTP
              </button>
            </div>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            id="phoneNumber"
            placeholder="Enter phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        {/* 🎂 Date of Birth Input */}
        <div className="input-group">
          <label htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            name="dob"
            id="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="dob-input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="register-btn">Register</button>

        <p className="signup-text">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;