import React, { useState, useEffect } from "react";
import UserService from "../../../services/userService";
import ImageProcess from "../../../utils/ImageProcess";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: "",
    profile: null,
    dob: "",
  });

  const [show, setShow] = useState({ email: false, phoneNumber: false });
  const [message, setMessage] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [previewProfile, setPreviewProfile] = useState(null);

  // --- Function to convert DOB to yyyy-mm-dd string ---
  const formatDobForInput = (dob) => {
    if (!dob) return "";
    return new Date(dob).toISOString().slice(0, 10);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await UserService.user();
        const userData = res.data;
        setUser({
          ...userData,
          dob: formatDobForInput(userData.dob),
        });
        setPreviewProfile(null);
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

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("name", user.name);
      formData.append("username", user.username);
      formData.append("dob", user.dob);
      if (profileFile) formData.append("profile", profileFile);

      const res = await UserService.updateProfile(formData);
      setMessage(res.data.message || "Profile updated successfully!");
      setProfileFile(null);
      // Refetch user after save to update state
      const updatedUser = await UserService.user();
      setUser({
        ...updatedUser.data,
        dob: formatDobForInput(updatedUser.data.dob),
      });
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {/* Profile Image */}
      <div className="profile-field">
        <label>Profile:</label>
        <div className="profile-image-wrapper">
          {previewProfile ? (
            <img
              src={previewProfile}
              alt="Preview"
              className="profile-preview changed"
            />
          ) : user.profile ? (
            <img
              src={ImageProcess.renderImage(user.profile)}
              alt="Profile"
              className="profile-preview"
            />
          ) : (
            <div className="placeholder">No Image</div>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>

      {/* Name */}
      <div className="profile-field">
        <label>Name:</label>
        <input
          type="text"
          value={user.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
      </div>

      {/* Username */}
      <div className="profile-field">
        <label>Username:</label>
        <input
          type="text"
          value={user.username}
          onChange={(e) => handleInputChange("username", e.target.value)}
        />
      </div>

      {/* DOB */}
      <div className="profile-field">
        <label>Date of Birth:</label>
        <input
          type="date"
          value={user.dob || ""}
          onChange={(e) => handleInputChange("dob", e.target.value)}
          className="dob-input"
        />
        {user.dob && (
          <small style={{ color: "#555", marginTop: "4px", display: "block" }}>
            Age: {calculateAge(user.dob)} years
          </small>
        )}
      </div>

      {/* Email */}
      <div className="profile-field">
        <label>Email:</label>
        <div className="input-with-icon">
          <span>{show.email ? user.email : "*".repeat(user.email.length)}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() =>
              setShow((prev) => ({ ...prev, email: !prev.email }))
            }
          >
            {show.email ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Phone */}
      <div className="profile-field">
        <label>Phone:</label>
        <div className="input-with-icon">
          <span>
            {show.phoneNumber ? user.phoneNumber : "*".repeat(user.phoneNumber.length)}
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() =>
              setShow((prev) => ({ ...prev, phoneNumber: !prev.phoneNumber }))
            }
          >
            {show.phoneNumber ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="save-container">
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Profile;