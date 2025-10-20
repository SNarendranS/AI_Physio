import React, { useState } from 'react';
import './InputForm.css';
import PainDataService from '../../../services/painDataService'; // adjust path if needed
import createExercise from '../../../utils/CreateExercise';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const InputForm = () => {
  const [formData, setFormData] = useState({
    injuryPlace: '',
    painType: '',
    painLevel: 1,
    description: '',
    doctorSlip: null,
  });
  const navigate = useNavigate()
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('injuryPlace', formData.injuryPlace);
      data.append('painType', formData.painType);
      data.append('painLevel', formData.painLevel);
      data.append('description', formData.description);

      if (formData.doctorSlip) {
        data.append('doctorSlip', formData.doctorSlip);
      }

      const response =
        await PainDataService.postPainData(data);
      toast.success('Pain data submitted successfully!');
      setFormData({
        injuryPlace: '',
        painType: '',
        painLevel: 1,
        description: '',
        doctorSlip: null,
      })

      const newResponse = await createExercise.createExerciseForPainData(response.data.data._id)
      setTimeout(() => {
        if (newResponse.data) {
          navigate(`/exercise/${false}/${response.data.data._id}`);
        }
      }, 500)


    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data. Try again!');
    }
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
          <option value="aching">Aching</option>
          <option value="radiating">Radiating</option>
          <option value="cramping">Cramping</option>
          <option value="tingling">Tingling</option>
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
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default InputForm;
