import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Button,
  Stack,
  Box
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Header = ({ AuthenticatedState }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [auth, setAuth] = AuthenticatedState;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    toast.warn("Logged out successfully!!!");
    setTimeout(() => navigate("/"), 500);
    closeMenu();
  };

  const NavLinks = () => (
    <Stack spacing={2} sx={{ width: 250, p: 3 }}>
      <Button component={Link} to="/data" onClick={closeMenu}>History</Button>
      <Button component={Link} to="/inputForm" onClick={closeMenu}>Form</Button>
      <Button component={Link} to="/profile" onClick={closeMenu}>Profile</Button>
      <Button component={Link} to="/exercise" onClick={closeMenu}>Exercise</Button>
      <Button component={Link} to="/contact" onClick={closeMenu}>Contact</Button>
      <Button color="warning" onClick={handleLogout}>Logout</Button>
    </Stack>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between",background:'#111' }}>
          
          {/* Logo */}
          <Typography
            variant="h6"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            AI Physio
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            {auth && (
              <>
                <Button color="inherit" component={Link} to="/data">History</Button>
                <Button color="inherit" component={Link} to="/inputForm">Form</Button>
                <Button color="inherit" component={Link} to="/profile">Profile</Button>
                <Button color="inherit" component={Link} to="/exercise">Exercise</Button>
                <Button color="inherit" component={Link} to="/contact">Contact</Button>
                <Button color="warning" onClick={handleLogout}>Logout</Button>
              </>
            )}
          </Box>

          {/* Mobile Hamburger */}
          {auth && (
            <IconButton
              color="inherit"
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={toggleMenu}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={closeMenu}
      >
        <NavLinks />
      </Drawer>
    </>
  );
};

export default Header;
