import React, { useEffect, useState } from 'react';
import './ExerciseList.css';
import ExerciseService from '../../../services/exerciseService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExerciseList = () => {
  const [exerciseSets, setExerciseSets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await ExerciseService.getExercises();
        if (!response.data || response.data.length === 0) {
          toast.info('No exercises found!');
        } else {
          setExerciseSets(response.data.reverse());
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch exercises!');
      }
    };
    fetchExercises();
  }, []);

  const handleOpenExercise = (id) => {
    navigate(`/exercise/${false}/${id}`); // Each ID refers to the painDataId or session ID
  };

  return (
    <div className="exercise-list-container">
      <h2>Assigned Exercise Sessions</h2>

      {exerciseSets.length === 0 ? (
        <p className="no-data">No exercise sessions assigned yet.</p>
      ) : (
        <div className="exercise-grid">
          {exerciseSets.map((session) => (
            <div
              className="exercise-card-min"
              key={session._id}
              onClick={() => handleOpenExercise(session._id)}
            >
              <div className="exercise-header-min">
                <h3>{session.exercises[0]?.targetArea || 'General Fitness'}</h3>
                <span className="session-progress">{session.progress}%</span>
              </div>

              <div className="exercise-mini-list">
                {session.exercises.slice(0, 2).map((ex) => (
                  <p key={ex._id}>
                    • {ex.exerciseName} ({ex.exerciseType})
                  </p>
                ))}
                {session.exercises.length > 2 && (
                  <p className="more">+ {session.exercises.length - 2} more</p>
                )}
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${session.progress}%` }}
                ></div>
              </div>

              <p className="created-date">
                {new Date(session.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseList;