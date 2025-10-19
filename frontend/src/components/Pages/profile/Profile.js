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
    profile: null, // base64 from backend
  });

  const [show, setShow] = useState({ email: false, phoneNumber: false });
  const [message, setMessage] = useState("");
  const [profileFile, setProfileFile] = useState(null); // uploaded file
  const [previewProfile, setPreviewProfile] = useState(null); // for local preview

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = () => {
    UserService.user()
      .then((res) => {
        setUser(res.data);
        setPreviewProfile(null);
      })
      .catch((err) => console.error(err));
  };

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
      formData.append("email", user.email);
      formData.append("name", user.name);
      formData.append("username", user.username);
      if (profileFile) formData.append("profile", profileFile);

      const res = await UserService.updateProfile(formData);
      setMessage(res.data.message || "Profile updated successfully!");
      setProfileFile(null);
      fetchUser();
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

      {/* Email */}
      <div className="profile-field">
        <label>Email:</label>
        <div className="input-with-icon">

          <span>{show.email ? user.email : "*".repeat(user.email.toString().length)}</span>
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
          <span>{show.phoneNumber ? user.phoneNumber : "*".repeat(user.phoneNumber.toString().length)}</span>
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