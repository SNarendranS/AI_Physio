import React, { useEffect, useState } from 'react';
import './ExerciseDetails.css';
import { useNavigate, useLocation } from 'react-router-dom';  //useParams,
import ExerciseService from '../../../services/exerciseService';
import PopupCamera from '../popupCamera/PopupCamera';
//import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import createExercise from '../../../utils/CreateExercise';
import { Capitalize } from '../../../utils/StringFunctions'
const ExerciseDetails = () => {
  //const { isPain, id } = useParams(); // painData id

  const location = useLocation();
  const { isPain, id } = location.state || {}; // ✅ Hidden, but still accessible

  const navigate = useNavigate();
  const [painData, setPainData] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null); // track which exercise camera is open


  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';

    // Match standard YouTube URL patterns
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (match) videoId = match[1];

    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };


  useEffect(() => {
    const fetchPainData = async () => {
      try {
        let response;

        if (isPain) {
          // 1️⃣ Try fetching existing exercises
          try {
            response = await ExerciseService.getExercisesByPainData(id);
          } catch (err) {
            // 2️⃣ If 404, no exercises exist, so create new ones
            if (err.response && err.response.status === 404) {
              try {
                const newResponse = await createExercise.createExerciseForPainData(id);
                setPainData(newResponse.data.savedExercise);

              } catch (createErr) {
                //toast.error('Failed to create exercises for this pain data');
                navigate('/exercise');

                return; // stop further execution
              }
            } else {
              throw err; // other errors
            }
          }
        } else {
          response = await ExerciseService.getExerciseById(id);
        }

        if (!response?.data) throw new Error('No data found');
        setPainData(response.data);

      } catch (error) {
        //toast.error('Failed to load exercises for this pain data');
        navigate('/exercise');
      }
    };

    fetchPainData();
  }, [id, navigate, isPain]);



  if (!painData) return <p className="loading">Loading exercises...</p>;

  return (
    <div className="exercise-details-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {painData.exercises && painData.exercises.map((exercise) => (
        <div className="details-card" key={exercise._id}>
          <h2>{Capitalize(exercise.exerciseName)}</h2>
          {exercise.image && <img src={exercise.image} alt='img' />}

          <p><strong>Type:</strong> {Capitalize(exercise.exerciseType)}</p>

          {exercise.exerciseType === 'repetition' && (
            <p><strong>Reps:</strong> {exercise.rep} × {exercise.set}</p>
          )}
          {exercise.exerciseType === 'hold' && (
            <p><strong>Hold Time:</strong> {exercise.holdTime}s × {exercise.set}</p>
          )}

          <p><strong>Target Area:</strong> {Capitalize(exercise.targetArea) || 'N/A'}</p>
          <p><strong>Equipment:</strong> {Capitalize(exercise.equipmentNeeded)}</p>
          <p><strong>Difficulty:</strong> {Capitalize(exercise.difficulty)}</p>
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

          {/* {exercise.demoVideo && (
            <video className="demo-video" controls>
              <source src={exercise.demoVideo} type="video/mp4" />
            </video>
          )} */}
          {exercise.demoVideo && (
            <div className="demo-video">
              <iframe
                width="100%"
                height="315"
                src={getEmbedUrl(exercise.demoVideo)}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}


          {/* {exercise.aiTrackingEnabled && (
            <button
              className="camera-btn"
              onClick={() => setActiveCamera(exercise._id)}
            >
              🎥 Open AI Camera
            </button>
          )} */}

          {/* PopupCamera for this exercise
          {activeCamera === exercise._id && (
            <PopupCamera
              exercise={exercise}
              onClose={() => setActiveCamera(null)}
            />
          )} */}
        </div>
      ))}
    </div>
  );
};

export default ExerciseDetails;
