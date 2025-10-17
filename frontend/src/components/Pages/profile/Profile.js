import React, { useState, useEffect } from "react";
import UserService from "../../../services/userService";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    phoneNumber: ""
  });

  const [originalUser, setOriginalUser] = useState({});
    //const [editable, setEditable] = useState(true);
  const [show, setShow] = useState({ email: false, phoneNumber: false });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch logged-in user
    UserService.user()
      .then((res) => {
        setUser(res.data);
        setOriginalUser(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleInputChange = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const handleSave = async () => {
    try {
      if (user.username !== originalUser.username) {
        const res = await UserService.user();
        if (res.data.exists) {
          setMessage("Username already taken!");
          return;
        }
      }

      const res = await UserService.updateProfile(originalUser, user);
      setMessage(res.data.message || "Profile updated successfully!");
      setOriginalUser(user);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

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
        <span>{show.email ? user.email : "********"}</span>
        <button
          className="show-btn"
          onClick={() => setShow({ ...show, email: !show.email })}
        >
          {show.email ? "Hide" : "Show"}
        </button>
      </div>

      {/* Phone */}
      <div className="profile-field">
        <label>Phone:</label>
        <span>{show.phoneNumber ? user.phoneNumber : "**********"}</span>
        <button
          className="show-btn"
          onClick={() =>
            setShow({ ...show, phoneNumber: !show.phoneNumber })
          }
        >
          {show.phoneNumber ? "Hide" : "Show"}
        </button>
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
