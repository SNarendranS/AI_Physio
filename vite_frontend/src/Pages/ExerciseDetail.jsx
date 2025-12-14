import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Divider,
  Chip
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import ExerciseService from "../services/exerciseService";
import createExercise from "../utils/CreateExercise";

const ExerciseDetails = () => {
  const location = useLocation();
  const { isPain, id } = location.state || {};
  const navigate = useNavigate();

  const [exerciseData, setExerciseData] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        let response;

        if (isPain) {
          try {
            response = await ExerciseService.getExercisesByPainData(id);
          } catch (err) {
            if (err.response?.status === 404) {
              const newRes = await createExercise.createExerciseForPainData(id);
              setExerciseData(newRes.data);
              return;
            }
            throw err;
          }
        } else {
          response = await ExerciseService.getExerciseById(id);
        }

        setExerciseData(response.data);
      } catch (err) {
        navigate("/exercise");
      }
    };

    fetchExercises();
  }, [id, isPain, navigate]);

  if (!exerciseData) {
    return (
      <Typography align="center" mt={4}>
        Loading exercises...
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      {/* AI Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">AI Summary</Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          {exerciseData.aiSummary}
        </Typography>

        <Box mt={2}>
          <Typography variant="body2">
            Overall Progress: {exerciseData.progress}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={exerciseData.progress}
            sx={{ mt: 1, height: 8, borderRadius: 4 }}
          />
        </Box>
      </Paper>

      {/* Exercise Cards */}
      <Stack spacing={2}>
        {exerciseData.exercises.map((ex, index) => (
          <Paper key={ex._id} elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6">
              {index + 1}. {ex.exerciseName}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1}>
              <Typography>
                <strong>Reps:</strong> {ex.reps}
              </Typography>

              <Typography>
                <strong>Sets:</strong> {ex.sets}
              </Typography>

              <Typography>
                <strong>Frequency:</strong> {ex.frequency}
              </Typography>

              <Typography>
                <strong>Description:</strong> {ex.description}
              </Typography>

              <Typography color="error">
                <strong>Precautions:</strong> {ex.precautions}
              </Typography>

              <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label={ex.completed ? "Completed" : "Pending"}
                  color={ex.completed ? "success" : "warning"}
                />
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default ExerciseDetails;
