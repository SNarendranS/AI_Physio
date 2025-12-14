import ExerciseService from '../services/exerciseService'; // adjust path if needed

const createExerciseForPainData = async (painDataId) => {
  try {
    const data = { painDataId };
    const response = await ExerciseService.createExercise(data);
    return response; // ✅ return the axios response
  } catch (err) {
    console.error('Error creating exercise:', err);
    throw err; // propagate error so outer useEffect can handle
  }
};

const createExercise = {
  createExerciseForPainData
};

export default createExercise;
