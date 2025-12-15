import React, { useEffect, useState, useRef } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Stack,
    Divider,
    CircularProgress,
    Container,
    Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PainDataService from "../services/painDataService";

/* ---------------- Severity Config ---------------- */
const getSeverityConfig = (severity) => {
    if (severity <= 3) return { label: "Mild", color: "success", bar: "#2e7d32" };
    if (severity <= 6) return { label: "Moderate", color: "warning", bar: "#ed6c02" };
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
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <Container sx={{ textAlign: "center", mt: 8 }}>
                <CircularProgress />
                <Typography mt={2}>Loading your records...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Typography variant="h5" fontWeight={700} mb={3}>
                Injury History
            </Typography>

            <Grid container spacing={4} justifyContent={'space-evenly'}>
                {painDataList.map((item) => {
                    const severity = getSeverityConfig(item.painSeverity);

                    return (
                        <Grid item width={300} key={item._id}>
                            <Card
                                elevation={4}
                                sx={{
                                    height: 450,
                                    width: "100%",
                                    minWidth: 0,
                                    boxSizing: "border-box",
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    transition: "transform .2s ease, box-shadow .2s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 6
                                    }
                                }}
                            >
                                {/* Severity Bar */}
                                <Box sx={{ height: 6, bgcolor: severity.bar, flexShrink: 0 }} />

                                <CardContent
                                    sx={{
                                        flex: 1,
                                        minHeight: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{ minWidth: 0 }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            noWrap
                                            sx={{ minWidth: 0 }}
                                        >
                                            {item.chiefComplaint || "No Complaint"}
                                        </Typography>

                                        <Chip
                                            label={severity.label}
                                            color={severity.color}
                                            size="small"
                                            sx={{ flexShrink: 0 }}
                                        />
                                    </Stack>

                                    <Divider />

                                    <Typography variant="body2">
                                        <strong>Pain Severity:</strong> {item.painSeverity}/10
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}
                                    >
                                        <strong>History:</strong> {item.history || "N/A"}
                                    </Typography>

                                    {item.goals?.length > 0 && (
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                Goals
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                flexWrap="wrap"
                                                sx={{ maxHeight: 64, overflow: "hidden" }}
                                            >
                                                {item.goals.slice(0, 4).map((g, i) => (
                                                    <Chip key={i} label={g} size="small" />
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}

                                    {item.aiReasons?.length > 0 && (
                                        <Box sx={{ flex: 1, minHeight: 0 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                AI Notes
                                            </Typography>
                                            <Box
                                                sx={{
                                                    overflowY: "auto",
                                                    maxHeight: 120,
                                                    pr: 1
                                                }}
                                            >
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

                                    <Box>
                                        <Chip
                                            label={`Triage: ${item.aiTriage}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </CardContent>

                                <Box p={2} flexShrink={0}>
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
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default History;



