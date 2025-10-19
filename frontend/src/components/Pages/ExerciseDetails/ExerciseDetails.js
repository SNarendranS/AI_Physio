import React, { useEffect, useState } from 'react';
import './ExerciseDetails.css';
import { useParams, useNavigate } from 'react-router-dom';
import ExerciseService from '../../../services/exerciseService';
import PopupCamera from '../popupCamera/PopupCamera';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExerciseDetails = () => {
  const { isPain,id } = useParams(); // painData id
  const navigate = useNavigate();
  const [painData, setPainData] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null); // track which exercise camera is open

  useEffect(() => {
    const fetchPainData = async () => {
      try {
        let response;
        if(isPain==="true"){
                  response = await ExerciseService.getExercisesByPainData(id);

        }
        else{
                   response= await ExerciseService.getExerciseById(id);

        }
        if (!response.data) throw new Error('No data found');
        setPainData(response.data);
      } catch (error) {
        toast.error('Failed to load exercises for this pain data');
        navigate('/exercises');
      }
    };
    fetchPainData();
  }, [id, navigate,isPain]);

  if (!painData) return <p className="loading">Loading exercises...</p>;

  return (
    <div className="exercise-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {painData.exercises.map((exercise) => (
        <div className="details-card" key={exercise._id}>
          <h2>{exercise.exerciseName}</h2>
          <p><strong>Type:</strong> {exercise.exerciseType}</p>

          {exercise.exerciseType === 'repetition' && (
            <p><strong>Reps:</strong> {exercise.rep} × {exercise.set}</p>
          )}
          {exercise.exerciseType === 'hold' && (
            <p><strong>Hold Time:</strong> {exercise.holdTime}s × {exercise.set}</p>
          )}

          <p><strong>Target Area:</strong> {exercise.targetArea || 'N/A'}</p>
          <p><strong>Equipment:</strong> {exercise.equipmentNeeded}</p>
          <p><strong>Difficulty:</strong> {exercise.difficulty}</p>
          <p><strong>Description:</strong> {exercise.description || 'N/A'}</p>
          <p><strong>Completed Sets:</strong> {exercise.completedSets}/{exercise.set}</p>

          <div className="progress-container">
            <p><strong>Progress:</strong> {Math.ceil(exercise.completedSets / exercise.set * 100)}%</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.ceil(exercise.completedSets / exercise.set * 100)}%` }}
              ></div>
            </div>
          </div>

          {exercise.demoVideo && (
            <video className="demo-video" controls>
              <source src={exercise.demoVideo} type="video/mp4" />
            </video>
          )}

          {exercise.aiTrackingEnabled && (
            <button
              className="camera-btn"
              onClick={() => setActiveCamera(exercise._id)}
            >
              🎥 Open AI Camera
            </button>
          )}

          {/* PopupCamera for this exercise */}
          {activeCamera === exercise._id && (
            <PopupCamera
              exercise={exercise}
              onClose={() => setActiveCamera(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ExerciseDetails;
