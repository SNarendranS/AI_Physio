import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Divider,
  IconButton
} from "@mui/material";
import {
  Email,
  Phone,
  Instagram,
  LinkedIn,
  GitHub
} from "@mui/icons-material";
import { toast } from "react-toastify";

const Contact = () => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback!");
      return;
    }

    // 🔧 API call can be added here
    toast.success("Thank you for your feedback!");
    setFeedback("");
  };

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 520 }}>
        <Stack spacing={3}>
          {/* Title */}
          <Typography variant="h5" align="center">
            Feedback
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
          >
            Your feedback helps us improve our platform 🚀
          </Typography>

          {/* Feedback Input */}
          <TextField
            label="Your Feedback"
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
          >
            Submit Feedback
          </Button>

          <Divider />

          {/* Contact Info */}
          <Stack spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Email fontSize="small" />
              <Typography variant="body2">
                support@aiphysio.com
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Phone fontSize="small" />
              <Typography variant="body2">
                +91 63799 80307
              </Typography>
            </Stack>
          </Stack>

          {/* Social Icons */}
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              component="a"
              href="https://www.instagram.com/narendran_06/"
              target="_blank"
            >
              <Instagram />
            </IconButton>

            <IconButton
              component="a"
              href="https://www.linkedin.com/in/narendran-saravanan-32169b23b/"
              target="_blank"
            >
              <LinkedIn />
            </IconButton>

            <IconButton
              component="a"
              href="https://github.com/SNarendranS"
              target="_blank"
            >
              <GitHub />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Contact;