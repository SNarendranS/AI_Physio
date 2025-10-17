import React from "react";
import "./Body.css";
import Login from "../../Pages/login/Login";
import InputForm from "../../Pages/inputForm/InputForm";
import { Route, Routes, Navigate } from "react-router-dom";
import Register from "../../Pages/register/Register";
import Profile from "../../Pages/profile/Profile";

const Body = ({ isAuthenticated }) => {
    // Check if user is logged in
    const [auth] = isAuthenticated;

    return (

        <main className="body-container">
            <Routes>
                {/* Default route: if logged in → InputForm, else → Login */}
                <Route
                    path="/"
                    element={
                        auth ? <Navigate to="/inputForm" replace /> : <Login isAuthenticated={isAuthenticated} />
                    }
                />
                <Route path="/register" element={<Register isAuthenticated={isAuthenticated}/>}/>
                {/* InputForm route: if not logged in → Login */}
                <Route
                    path="/inputForm"
                    element={
                        auth ? <InputForm /> : <Navigate to="/" replace />
                    }
                />
                                <Route
                    path="/profile"
                    element={
                        auth ? <Profile /> : <Navigate to="/" replace />
                    }
                />
            </Routes>
        </main>

    );
};

export default Body;
