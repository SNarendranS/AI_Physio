import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Avatar,
  IconButton,
  MenuItem
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import UserService from "../services/userService";
import ImageProcess from "../utils/ImageProcess";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    gender: "",
    email: "",
    phoneNumber: "",
    profile: null,
    dob: "",
    age: 0
  });

  const [show, setShow] = useState({ email: false, phoneNumber: false });
  const [message, setMessage] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [previewProfile, setPreviewProfile] = useState(null);

  const formatDobForInput = (dob) =>
    dob ? new Date(dob).toISOString().slice(0, 10) : "";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await UserService.user();
        const data = res.data;
        setUser({
          ...data,
          dob: formatDobForInput(data.dob)
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewProfile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("username", user.username);
      formData.append("gender", user.gender);
      formData.append("dob", user.dob);
      formData.append("email", user.email);
      if (profileFile) formData.append("profile", profileFile);

      const res = await UserService.updateProfile(formData);
      setMessage(res.data.message || "Profile updated successfully!");

      const updated = await UserService.user();
      setUser({
        ...updated.data,
        dob: formatDobForInput(updated.data.dob)
      });

      setProfileFile(null);
      setPreviewProfile(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Paper elevation={4} sx={{ borderRadius: 5, p: "2% 4%", width: 480, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h5" align="center">
            My Profile
          </Typography>

          {/* Profile Image */}
          <Stack alignItems="center" spacing={1}>
            <Avatar
              src={
                previewProfile
                  ? previewProfile
                  : user.profile
                    ? ImageProcess.renderImage(user.profile)
                    : ""
              }
              sx={{ width: 100, height: 100 }}
            />
            <Button variant="outlined" component="label">
              Upload Image
              <input hidden type="file" accept="image/*" onChange={handleFileChange} />
            </Button>
          </Stack>

          <TextField
            label="Name"
            value={user.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            fullWidth
          />

          <TextField
            label="Username"
            value={user.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            fullWidth
          />

          {/* Gender Dropdown */}
          <TextField
            select
            label="Gender"
            value={user.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            fullWidth
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </TextField>

          <TextField
            label="Date of Birth"
            type="date"
            value={user.dob || ""}
            onChange={(e) => handleInputChange("dob", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            helperText={user.dob ? `Age: ${user.age} years` : ""}

          />

          {/* Email (Masked) */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <TextField
              label="Email"
              value={
                show.email
                  ? user.email
                  : "*".repeat(user.email?.length || 0)
              }
              fullWidth
              disabled
            />
            <IconButton onClick={() => setShow(p => ({ ...p, email: !p.email }))}>
              {show.email ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Stack>

          {/* Phone (Masked) */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <TextField
              label="Phone Number"
              value={
                show.phoneNumber
                  ? user.phoneNumber
                  : "*".repeat(user.phoneNumber?.length || 0)
              }
              fullWidth
              disabled
            />
            <IconButton
              onClick={() =>
                setShow(p => ({ ...p, phoneNumber: !p.phoneNumber }))
              }
            >
              {show.phoneNumber ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </Stack>

          <Button variant="contained" size="large" onClick={handleSave}>
            Save Changes
          </Button>

          {message && (
            <Typography variant="body2" align="center" color="success.main">
              {message}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Profile;
