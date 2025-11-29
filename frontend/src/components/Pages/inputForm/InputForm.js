import React, { useState, useEffect } from "react";
import "./InputForm.css";
import SearchableDropdown from "../../layouts/dropDown/SearchableDropdown";
import PainDataService from "../../../services/painDataService";
import MetaDataService from "../../../services/metaDataService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const InputForm = () => {
  const [formData, setFormData] = useState({
    injuryPlace: "",
    painType: "",
    painLevel: 1,
    description: "",
    doctorSlip: null,
  });

  const [injuryPlaces, setInjuryPlaces] = useState([]);
  const [painTypes, setPainTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const injuryRes = await MetaDataService.getInjuryPlaces();
        setInjuryPlaces(injuryRes.data);

        const painRes = await MetaDataService.getPainTypes();
        setPainTypes(painRes.data);
      } catch {
        toast.error("Failed to load form data.");
      }
    };
    fetchMetaData();
  }, []);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value.toLowerCase(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData || !formData.injuryPlace || !formData.painType || !formData.description) {
        toast.error("Invalid Input!");
        return;
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val ?? ""));
      const response = await PainDataService.postPainDataAndCreateExercise(data);
      toast.success("Pain data submitted successfully!");
      setFormData({ injuryPlace: "", painType: "", painLevel: 1, description: "", doctorSlip: null, });
      if (response.data) {
        navigate("/exerciseDetail", { state: { isPain: true, id: response.data.savedExercise._id }, });
      }
    }
    catch (error) {
      console.error(error.response?.data?.message)
      toast.error(error.response?.data?.message || "Submission failed");
    }
  };


  return (
    <div className="form-wrapper">
      <form className="custom-form" onSubmit={handleSubmit}>
        <h2>Tell us about your injury</h2>
        <SearchableDropdown
          label="Injury Location"
          placeholder="Select or type injury location"
          items={injuryPlaces}
          value={formData.injuryPlace}
          onSelect={(val) => setFormData({ ...formData, injuryPlace: val })}
        />
        <SearchableDropdown
          label="Type of Pain"
          placeholder="Select or type pain type"
          items={painTypes}
          value={formData.painType}
          onSelect={(val) => setFormData({ ...formData, painType: val })}
        />

        <label>Pain Level: {formData.painLevel}</label>
        <input
          type="range"
          name="painLevel"
          min="1"
          max="10"
          value={formData.painLevel}
          onChange={handleChange}
          className="custom-range"
        />

        <label>Description / Notes</label>
        <textarea
          name="description"
          placeholder="Describe your injury or discomfort"
          value={formData.description}
          onChange={handleChange}
          className="custom-textarea"
        />

        <label>Upload Doctor Slip (optional)</label>
        <input
          type="file"
          name="doctorSlip"
          accept="image/*"
          onChange={handleChange}
          className="custom-file"
        />

        <button type="submit" className="custom-submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default InputForm;
