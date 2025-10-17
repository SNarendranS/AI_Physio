import React, { useEffect, useState } from 'react';
import Auth from '../../../services/authService'
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Login.css';

const Login = ({ isAuthenticated }) => {
  const [credential, setCredential] = useState({ 'email': '', 'password': '' });
  const navigate = useNavigate()
  const [auth, setAuth] = isAuthenticated
  const handleChange = (e) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    validateUser(credential)
  }
  const tempLogin = () => {
    setCredential({ 'email': "narendran061102@gmail.com", 'password': "nnn@123" })
  }
  const validateUser = async (user) => {
    try {
      await tempLogin()

      const response = await Auth.login(user)
      let token = response.data.token
      localStorage.setItem('token', JSON.stringify(token))
      toast.success("Welcome Back!!!")
      setAuth(true)
      // Wait a tiny bit to let toast show before navigating
      setTimeout(() => {
        if (auth) {
          navigate('/exerciseList')
        }
      }, 100)
    } catch (error) {
      console.log(error)
      toast.error("Login Unsuccessful!!!")
    }
  }
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your account</p>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={credential.email}
            onChange={handleChange}
          //required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={credential.password}
            onChange={handleChange}
          //required
          />
        </div>

        <button type="submit" name="login" className="login-btn">Login</button>

        <p className="signup-text">
          Don’t have an account? <Link to='/register'>Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
