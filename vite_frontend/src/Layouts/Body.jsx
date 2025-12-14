import React from "react";
import { Box, Container } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import Profile from "../Pages/Profile";
import Contact from "../Pages/Contact";
import InputForm from "../Pages/InputForm";
import ExerciseDetails from "../Pages/ExerciseDetail";
import ExerciseList from "../Pages/ExerciseList";

// import PainDataList from "../../Pages/painDataList/PainDataList";

// PrivateRoute: only accessible if logged in
const PrivateRoute = ({ auth, children }) => {
  return auth ? children : <Navigate to="/" replace />;
};

// PublicRoute: only accessible if NOT logged in
const PublicRoute = ({ auth, children }) => {
  return !auth ? children : <Navigate to="/profile" replace />;
};

const Body = ({ AuthenticatedState }) => {
  const [auth] = AuthenticatedState;

  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 24vh)",
        backgroundColor: "#f5f7fa",
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute auth={auth}>
                <Login AuthenticatedState={AuthenticatedState} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute auth={auth}>
                <Register AuthenticatedState={AuthenticatedState} />
              </PublicRoute>
            }
          />

          <Route
            path="/inputForm"
            element={
              <PrivateRoute auth={auth}>
                <InputForm />
              </PrivateRoute>
            }
          />
           <Route
            path="/exerciseDetail"
            element={
              <PrivateRoute auth={auth}>
                <ExerciseDetails />
              </PrivateRoute>
            }
          />
           <Route
            path="/exercise"
            element={
              <PrivateRoute auth={auth}>
                <ExerciseList />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/data"
            element={
              <PrivateRoute auth={auth}>
                <PainDataList />
              </PrivateRoute>
            }
          />*/}
          <Route
            path="/profile"
            element={
              <PrivateRoute auth={auth}>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute auth={auth}>
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={auth ? "/profile" : "/"} replace />}
          />
        </Routes>
      </Container>
    </Box>
  );
};

export default Body;
