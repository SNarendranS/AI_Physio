import React, { useState } from "react";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Stack,
    Link as MuiLink,
    MenuItem
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Auth from "../services/authService";

const Register = ({ AuthenticatedState }) => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        gender: "",
        email: "",
        phoneNumber: "",
        dob: "",
        password: "",
        confirmPassword: ""
    });

    const [, setAuth] = AuthenticatedState;

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const sendOtp = async () => {
        if (!formData.email) {
            toast.error("Please enter a valid email!");
            return;
        }
        try {
            await Auth.sendOtp({ email: formData.email });
            setOtpSent(true);
            toast.success(`OTP sent to ${formData.email}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to send OTP");
        }
    };

    const verifyOtp = async () => {
        try {
            await Auth.verifyOtp({ email: formData.email, otp });
            setOtpVerified(true);
            toast.success("OTP verified successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Invalid OTP!");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // if (!otpVerified) {
        //     toast.error("Please verify your email OTP first!");
        //     return;
        // }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            const response = await Auth.register(formData);
            localStorage.setItem("token", JSON.stringify(response.data.token));
            toast.success("Registration successful!");

            setAuth(true);

            setTimeout(() => {
                navigate("/exercise");
            }, 400);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Registration failed!");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Paper elevation={4} sx={{ p: "2% 4%", width: 420,borderRadius:5 }}>
                <Stack spacing={1}>
                    <Typography variant="h5" align="center">
                        Create Account
                    </Typography>

                    <Typography variant="body2" align="center" color="text.secondary">
                        Fill in your details to sign up
                    </Typography>

                    <TextField
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        fullWidth
                    >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                    </TextField>
                    {/* Email + OTP */}
                    <Stack direction="row" spacing={1}>
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            disabled={otpSent && !otpVerified}
                        />
                        {!otpVerified && (
                            <Button variant="outlined" onClick={sendOtp}>
                                Send OTP
                            </Button>
                        )}
                    </Stack>

                    {otpSent && !otpVerified && (
                        <Stack direction="row" spacing={1}>
                            <TextField
                                label="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" onClick={verifyOtp}>
                                Verify
                            </Button>
                        </Stack>
                    )}

                    <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Date of Birth"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />

                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleRegister}
                    >
                        Register
                    </Button>

                    <Typography variant="body2" align="center">
                        Already have an account?{" "}
                        <MuiLink component={Link} to="/">
                            Login
                        </MuiLink>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default Register;
