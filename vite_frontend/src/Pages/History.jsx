import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Stack,
    Divider,
    CircularProgress,
    Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PainDataService from "../services/painDataService";

/* ---------------- Severity Config ---------------- */
const getSeverityConfig = (severity) => {
    if (severity <= 3)
        return { label: "Mild", color: "success", bar: "#2e7d32" };
    if (severity <= 6)
        return { label: "Moderate", color: "warning", bar: "#ed6c02" };
    return { label: "Severe", color: "error", bar: "#d32f2f" };
};

const History = () => {
    const [painDataList, setPainDataList] = useState([]);
    const [loading, setLoading] = useState(true);
    const toastShown = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const fetchPainData = async () => {
            try {
                const res = await PainDataService.painData();
                if (mounted) setPainDataList(res.data.reverse());
            } catch {
                if (!toastShown.current) {
                    toast.error("Failed to load pain data!");
                    toastShown.current = true;
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPainData();
        return () => (mounted = false);
    }, []);

    if (loading) {
        return (
            <Box textAlign="center" mt={6}>
                <CircularProgress />
                <Typography mt={2}>Loading your records...</Typography>
            </Box>
        );
    }

    return (
        <Container sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ p: 1, maxWidth: 2000, mx: "auto" }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    Injury History
                </Typography>

                {/* 🔒 LOCKED GRID SYSTEM */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 4
                    }}
                >
                    {painDataList.map((item) => {
                        const severity = getSeverityConfig(item.painSeverity);

                        return (
                            <Card
                                key={item._id}
                                elevation={4}
                                sx={{
                                    height: 480,
                                    width: 450,
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 6
                                    }
                                }}
                            >
                                {/* Severity Indicator */}
                                <Box sx={{ height: 6, bgcolor: severity.bar }} />

                                <CardContent
                                    sx={{
                                        flexGrow: 1,
                                        display: "flex",
                                        flexDirection: "column"
                                    }}
                                >
                                    {/* Header */}
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                overflow: "hidden",
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                maxWidth: "72%"
                                            }}
                                        >
                                            {item.chiefComplaint || "No Complaint"}
                                        </Typography>

                                        <Chip
                                            label={severity.label}
                                            color={severity.color}
                                            size="small"
                                        />
                                    </Stack>

                                    <Divider sx={{ my: 1 }} />

                                    {/* Body */}
                                    <Typography variant="body2">
                                        <strong>Pain Severity:</strong> {item.painSeverity}/10
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            mt: 1,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <strong>History:</strong> {item.history || "N/A"}
                                    </Typography>

                                    {/* Goals */}
                                    {item.goals?.length > 0 && (
                                        <Box mt={1}>
                                            <Typography variant="body2" fontWeight={600}>
                                                Goals
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {item.goals.slice(0, 4).map((g, i) => (
                                                    <Chip key={i} label={g} size="small" />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    {/* AI Notes */}
                                    {item.aiReasons?.length > 0 && (
                                        <Box mt={1} sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                AI Notes
                                            </Typography>
                                            <Box sx={{ maxHeight: 110, overflowY: "auto" }}>
                                                <ul style={{ paddingLeft: 18, margin: 0 }}>
                                                    {item.aiReasons.map((r, i) => (
                                                        <li key={i}>
                                                            <Typography variant="body2">{r}</Typography>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Box>
                                        </Box>
                                    )}

                                    <Box mt={1}>
                                        <Chip
                                            label={`Triage: ${item.aiTriage}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </CardContent>

                                {/* Footer */}
                                <Box p={2}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={() =>
                                            navigate("/exerciseDetail", {
                                                state: { isPain: true, id: item._id }
                                            })
                                        }
                                    >
                                        View Exercises
                                    </Button>
                                </Box>
                            </Card>
                        );
                    })}
                </Box>
            </Box>
        </Container>

    );
};

export default History;
