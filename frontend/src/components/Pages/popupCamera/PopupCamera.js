import React from 'react';
import './PopupCamera.css';

const PopupCamera = ({ exercise, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-camera-container">
        <button className="popup-close-btn" onClick={onClose}>✖</button>
        <h2>{exercise.exerciseName}</h2>

        {/* Camera or AI Tracking area */}
        <div className="camera-area">
          {/* Replace this div with actual camera feed */}
          <p>Camera feed will appear here...</p>
        </div>
      </div>
    </div>
  );
};

export default PopupCamera;
