import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    LinearProgress,
    Divider,
    Chip,
    Grid,
    Avatar
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
            } catch {
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
        <Box sx={{ maxWidth: 960, mx: "auto", p: 3 }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back
            </Button>

            {/* AI Summary Card */}
            <Card
                elevation={3}
                sx={{
                    borderRadius: 3,
                    mb: 4,
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                        bgcolor: "primary.main"
                    }
                }}
            >
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6" fontWeight={700}>
                            AI Summary
                        </Typography>

                        <Typography color="text.secondary">
                            {exerciseData.aiSummary}
                        </Typography>

                        {/* <Box>
                            <Stack direction="row" justifyContent="space-between">
                                <Typography variant="body2">Overall Progress</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {exerciseData.progress}%
                                </Typography>
                            </Stack>

                            <LinearProgress
                                variant="determinate"
                                value={exerciseData.progress}
                                sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                            />
                        </Box> */}
                    </Stack>
                </CardContent>
            </Card>

            {/* Exercises */}
            <Stack spacing={2}>
                {exerciseData.exercises.map((ex, index) => (
                    <Card
                        key={ex._id}
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                            transition: "0.2s",
                            "&:hover": { boxShadow: 6 }
                        }}
                    >
                        <CardContent>
                            <Grid container spacing={2} alignItems="flex-start" justifyContent="space-between">
                                {/* Index Icon */}
                                <Grid item>
                                    <Grid item>
                                        <Avatar sx={{ bgcolor: "primary.light" }}>
                                            <FitnessCenterIcon />
                                        </Avatar>
                                    </Grid>

                                    {/* Main Content */}
                                    <Grid item xs>
                                        <Typography fontWeight={600} gutterBottom>
                                            {index + 1}. {ex.exerciseName}
                                        </Typography>

                                        {/* Meta Chips */}
                                        <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                                            <Chip label={`Reps: ${ex.reps}`} size="small" />
                                            <Chip label={`Sets: ${ex.sets}`} size="small" />
                                            <Chip label={ex.frequency} size="small" />
                                        </Stack>

                                        <Typography variant="body2" color="text.secondary">
                                            {ex.description}
                                        </Typography>

                                        {/* Precautions */}
                                        {ex.precautions && (
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="flex-start"
                                                mt={1}
                                            >
                                                <WarningAmberIcon
                                                    fontSize="small"
                                                    color="warning"
                                                    sx={{ mt: "2px" }}
                                                />
                                                <Typography variant="body2" color="warning.main">
                                                    {ex.precautions}
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Grid>
                                </Grid>


                                {/* Status */}
                                {/* <Grid item>
                                    <Chip
                                        icon={
                                            ex.completed ? (
                                                <CheckCircleIcon />
                                            ) : (
                                                <PendingIcon />
                                            )
                                        }
                                        label={ex.completed ? "Completed" : "Pending"}
                                        color={ex.completed ? "success" : "warning"}
                                        size="small"
                                    />
                                </Grid> */}
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default ExerciseDetails;
