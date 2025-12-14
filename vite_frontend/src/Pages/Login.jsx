import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Link as MuiLink
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Auth from "../services/authService";

const Login = ({ AuthenticatedState }) => {
  const [credential, setCredential] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();
  const [, setAuth] = AuthenticatedState;

  const handleChange = (e) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await Auth.login(credential);
      const token = response.data.token;

      localStorage.setItem("token", JSON.stringify(token));
      toast.success("Welcome Back!!!");

      setAuth(true);

      setTimeout(() => {
        navigate("/exercise");
      }, 300);
    } catch (error) {
      console.error(error);
      toast.error("Login Unsuccessful!!!");
    }
  };

  const tempLogin = () => {
    setCredential({
      email: "narendran061102@gmail.com",
      password: "Naren@123"
    });
  };

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 360,borderRadius:5 }}>
        <Stack spacing={2}>
          <Typography variant="h5" align="center">
            Welcome Back
          </Typography>

          <Typography variant="body2" align="center" color="text.secondary">
            Login to your account
          </Typography>

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={credential.email}
            onChange={handleChange}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={credential.password}
            onChange={handleChange}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
          >
            Login
          </Button>

          {/* Optional: Dev Auto-fill */}
          <Button
            variant="text"
            size="small"
            onClick={tempLogin}
          >
            Auto Fill Credentials
          </Button>

          <Typography variant="body2" align="center">
            Don’t have an account?{" "}
            <MuiLink component={Link} to="/register">
              Sign Up
            </MuiLink>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
