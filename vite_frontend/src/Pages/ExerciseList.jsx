import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Stack,
  Divider,
  Chip
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ExerciseService from "../services/exerciseService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ExerciseList = () => {
  const [exerciseSets, setExerciseSets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await ExerciseService.getExercises();
        if (!response.data?.length) {
          toast.info("No exercises found!");
        } else {
          setExerciseSets(response.data.reverse());
        }
      } catch (error) {
        toast.error("Failed to fetch exercises!");
      }
    };
    fetchExercises();
  }, []);

  const handleOpenExercise = (id) => {
    navigate("/exerciseDetail", { state: { isPain: false, id } });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        🏋️ Assigned Exercise Sessions
      </Typography>

      <Stack spacing={2}>
        {exerciseSets
          .filter((s) => s.aiSummary?.toLowerCase() !== "patient summary")
          .map((session) => (
            <Paper
              key={session._id}
              elevation={3}
              onClick={() => handleOpenExercise(session._id)}
              sx={{
                p: 2.5,
                borderRadius: 2,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)"
                }
              }}
            >
              {/* Header */}
              <Stack direction="row" spacing={1} alignItems="center">
                <FitnessCenterIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  {session.aiSummary || "Exercise Session"}
                </Typography>
              </Stack>

              {/* Exercises */}
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                mt={1.5}
              >
                {session.exercises.slice(0, 3).map((ex) => (
                  <Chip
                    key={ex._id}
                    label={ex.exerciseName}
                    size="small"
                    variant="outlined"
                  />
                ))}
                {session.exercises.length > 3 && (
                  <Chip
                    label={`+${session.exercises.length - 3} more`}
                    size="small"
                    color="secondary"
                  />
                )}
              </Stack>

              {/* Progress */}
              <Box mt={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {session.progress}%
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={session.progress}
                  sx={{ height: 8, borderRadius: 5, mt: 0.5 }}
                />
              </Box>

              <Divider sx={{ my: 1.5 }} />

              {/* Date */}
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayIcon sx={{ fontSize: 16 }} color="disabled" />
                <Typography variant="caption" color="text.secondary">
                  {new Date(session.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>
            </Paper>
          ))}
      </Stack>
    </Box>
  );
};

export default ExerciseList;
