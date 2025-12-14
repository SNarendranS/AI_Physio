import React from "react";
import { Box, Typography, Link, Stack } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 2,
        px: 2,
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        textAlign: "center"
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} AI Physio. All rights reserved.
      </Typography>

      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        sx={{ mt: 1 }}
      >
        <Link href="#privacy" color="inherit" underline="hover">
          Privacy Policy
        </Link>
        <Link href="#terms" color="inherit" underline="hover">
          Terms of Service
        </Link>
        <Link href="#contact" color="inherit" underline="hover">
          Contact
        </Link>
      </Stack>
    </Box>
  );
};

export default Footer;
