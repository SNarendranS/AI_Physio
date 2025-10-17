import { useState } from 'react';
import './Header.css';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Header = ({ isAuthenticated }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate()
    const [auth, setAuth] = isAuthenticated;
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");   // remove token
        setAuth(false);                      // update state
        toast.warn("Logged out successfully!!!"); // show toast
        setTimeout(() => navigate('/'), 500);     // navigate after 0.5s
    }

    return (
        <header className="header">
            <div className="logo">MyLogo</div>
            <nav className={`nav ${menuOpen ? 'open' : ''}`}>
                {
                    auth ? <>
                        <Link to='/profile'>Profile</Link>
                        <a href="#services">Form</a>
                        <a href="#about">Exercise</a>
                        <a href="#contact">Contact</a>
                        <button onClick={handleLogout}>Logout</button>
                    </> :
                        <></>
                }


            </nav>
            <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </header>
    );
};

export default Header;
