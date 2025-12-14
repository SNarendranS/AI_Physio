import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Slider,
  Chip
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import PainDataService from "../services/painDataService";

const InputForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    chiefComplaint: "",
    painSeverity: 1,
    history: "",
    goals: [],
    extraContext: ""
  });

  const [goalInput, setGoalInput] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddGoal = () => {
    if (!goalInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      goals: [...prev.goals, goalInput.trim()]
    }));
    setGoalInput("");
  };

  const handleRemoveGoal = (goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g !== goal)
    }));
  };

  const handleSubmit = async () => {
    const { chiefComplaint, painSeverity } = formData;

    if (!chiefComplaint || !painSeverity) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const res = await PainDataService.postPainDataAndCreateExercise(formData);

      toast.success("AI Exercise plan created!");

      if (res.data?.exercise?._id) {
        navigate("/exerciseDetail", {
          state: {
            isPain: true,
            id: res.data.exercise._id
          }
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 520 }}>
        <Stack spacing={3}>
          <Typography variant="h5" align="center">
            Tell us about your pain
          </Typography>

          {/* Chief Complaint */}
          <TextField
            label="Chief Complaint"
            name="chiefComplaint"
            multiline
            rows={2}
            value={formData.chiefComplaint}
            onChange={handleChange}
            placeholder="e.g. mild knee discomfort after slipping"
            fullWidth
            required
          />

          {/* Pain Severity */}
          <Box>
            <Typography gutterBottom>
              Pain Severity: {formData.painSeverity}
            </Typography>
            <Slider
              value={formData.painSeverity}
              min={1}
              max={10}
              step={1}
              marks
              onChange={(_, value) =>
                setFormData({ ...formData, painSeverity: value })
              }
            />
          </Box>

          {/* History */}
          <TextField
            label="Medical History (optional)"
            name="history"
            multiline
            rows={2}
            value={formData.history}
            onChange={handleChange}
            placeholder="e.g. hairline crack healed one year ago"
            fullWidth
          />

          {/* Goals */}
          <Box>
            <Typography gutterBottom>Recovery Goals</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="Add a goal"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={handleAddGoal}>
                Add
              </Button>
            </Stack>

            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {formData.goals.map((goal, idx) => (
                <Chip
                  key={idx}
                  label={goal}
                  onDelete={() => handleRemoveGoal(goal)}
                />
              ))}
            </Stack>
          </Box>

          {/* Extra Context */}
          <TextField
            label="Additional Context (optional)"
            name="extraContext"
            multiline
            rows={2}
            value={formData.extraContext}
            onChange={handleChange}
            placeholder="Any extra details for better AI understanding"
            fullWidth
          />

          {/* Submit */}
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
          >
            Generate Exercise Plan
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default InputForm;
