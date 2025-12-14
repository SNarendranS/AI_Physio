import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Stack,
    Chip,
    Avatar,
    Grid
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExerciseService from "../services/exerciseService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/* ------------------ Severity Helpers ------------------ */
const getSeverity = (summary = "") => {
    const text = summary.toLowerCase();
    if (text.includes("severe")) return "severe";
    if (text.includes("moderate")) return "moderate";
    if (text.includes("mild")) return "mild";
    return "default";
};

const severityStyles = {
    mild: {
        color: "success.main",
        label: "Mild"
    },
    moderate: {
        color: "warning.main",
        label: "Moderate"
    },
    severe: {
        color: "error.main",
        label: "Severe"
    },
    default: {
        color: "primary.main",
        label: "Normal"
    }
};

/* ------------------ Component ------------------ */
const ExerciseList = () => {
    const [exerciseSets, setExerciseSets] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await ExerciseService.getExercises();
                if (!res.data?.length) toast.info("No exercises found!");
                else setExerciseSets(res.data.reverse());
            } catch {
                toast.error("Failed to fetch exercises!");
            }
        };
        fetchExercises();
    }, []);

    return (
        <Box sx={{ maxWidth: 960, mx: "auto", p: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={3}>
                Exercise Sessions
            </Typography>

            <Stack spacing={2}>
                {exerciseSets
                    .filter(s => s.aiSummary?.toLowerCase() !== "patient summary")
                    .map(session => {
                        const severity = getSeverity(session.aiSummary);
                        const severityUI = severityStyles[severity];

                        return (
                            <Card
                                key={session._id}
                                onClick={() =>
                                    navigate("/exerciseDetail", {
                                        state: { isPain: false, id: session._id }
                                    })
                                }
                                sx={{
                                    cursor: "pointer",
                                    borderRadius: 3,
                                    position: "relative",
                                    overflow: "hidden",
                                    minHeight: 170,
                                    transition: "0.25s",
                                    "&:hover": {
                                        transform: "translateY(-3px)",
                                        boxShadow: 8
                                    },
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: 6,
                                        bgcolor: severityUI.color
                                    }
                                }}
                            >
                                <CardContent>
                                    <Grid container spacing={2} justifyContent="space-between">
                                        {/* Icon */}
                                        <Grid item sx={{ width: 0.5 }}>

                                            <Grid item>
                                                <Avatar sx={{ bgcolor: `${severityUI.color}` }}>
                                                    <FitnessCenterIcon />
                                                </Avatar>
                                            </Grid>
                                            <Grid item xs>
                                                <Stack spacing={2} width={"180%"}>
                                                    {/* Summary */}
                                                    <Typography fontWeight={600} lineHeight={2} padding={2}>
                                                        {session.aiSummary}
                                                    </Typography>

                                                    {/* Exercise Chips (fixed height zone) */}
                                                    <Box sx={{ minHeight: 32 }}>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                                            {session.exercises.slice(0, 3).map(ex => (
                                                                <Chip
                                                                    key={ex._id}
                                                                    label={ex.exerciseName}
                                                                    size="small"
                                                                />
                                                            ))}
                                                            {session.exercises.length > 3 && (
                                                                <Chip
                                                                    label={`+${session.exercises.length - 3}`}
                                                                    size="small"
                                                                    color="secondary"
                                                                />
                                                            )}
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                        <Grid item>
                                            <Stack spacing={1} alignItems="flex-end">
                                                <Chip
                                                    label={severityUI.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: severityUI.color,
                                                        color: "#fff",
                                                        fontWeight: 600
                                                    }}
                                                />
                                                <Chip
                                                    label={`${session.progress}%`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Grid>

                                        {/* Arrow */}

                                    </Grid>

                                    {/* Progress Bar */}
                                    <Box mt={2}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={session.progress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: "grey.200",
                                                "& .MuiLinearProgress-bar": {
                                                    bgcolor: severityUI.color
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Date */}
                                    <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                                        <CalendarTodayIcon sx={{ fontSize: 14 }} />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(session.createdAt).toLocaleDateString()}
                                        </Typography>
                                        <ChevronRightIcon color="disabled" />
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
            </Stack>
        </Box>
    );
};

export default ExerciseList;
