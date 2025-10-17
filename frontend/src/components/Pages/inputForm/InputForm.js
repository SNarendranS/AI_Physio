import React, { useState } from 'react';
import './InputForm.css';

const InputForm = () => {
  const [formData, setFormData] = useState({
    injuryPlace: '',
    painType: '',
    painLevel: 5,
    description: '',
    doctorSlip: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // send to backend for AI exercise suggestion
  };

  return (
    <div className="input-form-container">
      <form className="input-form" onSubmit={handleSubmit}>
        <h2>Tell us about your injury</h2>

        <label>Injury Location</label>
        <input
          type="text"
          name="injuryPlace"
          placeholder="e.g., Knee, Shoulder"
          value={formData.injuryPlace}
          onChange={handleChange}
          required
        />

        <label>Type of Pain</label>
        <select
          name="painType"
          value={formData.painType}
          onChange={handleChange}
          required
        >
          <option value="">Select Pain Type</option>
          <option value="sharp">Sharp</option>
          <option value="dull">Dull</option>
          <option value="throbbing">Throbbing</option>
          <option value="burning">Burning</option>
          <option value="stiffness">Stiffness</option>
        </select>

        <label>Pain Level: {formData.painLevel}</label>
        <input
          type="range"
          name="painLevel"
          min="1"
          max="10"
          value={formData.painLevel}
          onChange={handleChange}
        />

        <label>Description / Notes</label>
        <textarea
          name="description"
          placeholder="Describe your injury or discomfort"
          value={formData.description}
          onChange={handleChange}
        />

        <label>Upload Doctor Slip (optional)</label>
        <input
          type="file"
          name="doctorSlip"
          accept="image/*,.pdf"
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default InputForm;
