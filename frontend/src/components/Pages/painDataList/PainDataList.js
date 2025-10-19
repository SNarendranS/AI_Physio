import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PainDataList.css';
import PainDataService from '../../../services/painDataService';
import ImageProcess from "../../../utils/ImageProcess";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PainDataList = () => {
  const [painDataList, setPainDataList] = useState([]);
  const toastShown = useRef(false); // prevent multiple toasts
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchPainData = async () => {
      try {
        const response = await PainDataService.painData();
        if (isMounted) setPainDataList(response.data.reverse());
      } catch (error) {
        if (!toastShown.current) {
          toast.error('Failed to load pain data!');
          toastShown.current = true;
        }
      }
    };

    fetchPainData();

    return () => { isMounted = false; };
  }, []);

  const handleViewExercises = async (painDataId) => {
    try {
      const painData = true
      navigate(`/exercise/${painData}/${painDataId}`);
    } catch (err) {
      toast.error("Failed to fetch exercises!");
    }
  };

  return (
    <div className="pain-data-list-container">
      <h2>Your Submitted Injury Data</h2>

      {painDataList.length === 0 ? (
        <p className="no-data">No injury records found.</p>
      ) : (
        <div className="pain-data-grid">
          {painDataList.map((item, index) => (
            <div className="pain-card" key={index}>
              <h3>{item.injuryPlace}</h3>
              <p><strong>Type:</strong> {item.painType}</p>
              <p><strong>Pain Level:</strong> {item.painLevel}/10</p>
              <p><strong>Description:</strong> {item.description || 'N/A'}</p>

              {item.doctorSlip && item.doctorSlip.data && (
                <div className="image-section">
                  <p><strong>Doctor Slip:</strong></p>
                  <img
                    src={ImageProcess.renderImage(item.doctorSlip)}
                    alt="Doctor Slip"
                    className="doctor-slip-img"
                  />
                </div>
              )}

              <button
                className="view-exercises-btn"
                onClick={() => handleViewExercises(item._id)}
              >
                View Exercises
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PainDataList;
