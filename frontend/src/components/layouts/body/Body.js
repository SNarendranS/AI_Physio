import React from "react";
import "./Body.css";
import Login from "../../Pages/login/Login";
import Register from "../../Pages/register/Register";
import InputForm from "../../Pages/inputForm/InputForm";
import Profile from "../../Pages/profile/Profile";
import PainDataList from "../../Pages/painDataList/PainDataList";
import { Routes, Route, Navigate } from "react-router-dom";
import ExerciseList from "../../Pages/exerciseList/ExerciseList";
import ExerciseDetails from "../../Pages/ExerciseDetails/ExerciseDetails";
import ContactsPage from "../../Pages/contact/Contact";

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
        <main className="body-container">
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

                {/* Private routes */}
                <Route
                    path="/inputForm"
                    element={
                        <PrivateRoute auth={auth}>
                            <InputForm />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/data"
                    element={
                        <PrivateRoute auth={auth}>
                            <PainDataList />
                        </PrivateRoute>
                    }
                />
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
                            <ContactsPage />
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
                <Route
                    path="/exerciseDetail"
                    element={
                        <PrivateRoute auth={auth}>
                            <ExerciseDetails />
                        </PrivateRoute>
                    }
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to={auth ? "/profile" : "/"} replace />} />
            </Routes>
        </main>
    );
};

export default Body;
