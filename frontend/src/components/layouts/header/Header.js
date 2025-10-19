import { useState, useEffect, useRef } from 'react';
import './Header.css';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Header = ({ AuthenticatedState }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [auth, setAuth] = AuthenticatedState;

  const navRef = useRef(null);
  const burgerRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuth(false);
    toast.warn("Logged out successfully!!!");
    setTimeout(() => navigate('/'), 500);
    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        navRef.current &&
        burgerRef.current &&
        !navRef.current.contains(e.target) &&
        !burgerRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="logo" onClick={() => { navigate('/'); closeMenu(); }}>
        AI Physio
      </div>

      <nav ref={navRef} className={`nav ${menuOpen ? 'open' : ''}`}>
        {auth && (
          <>
            <Link to="/data" onClick={closeMenu}>History</Link>
            <Link to="/inputForm" onClick={closeMenu}>Form</Link>
            <Link to="/profile" onClick={closeMenu}>Profile</Link>
            <Link to="/exercise" onClick={closeMenu}>Exercise</Link>
            <Link to="/contact" onClick={closeMenu}>Contact</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

      <div ref={burgerRef} className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </header>
  );
};

export default Header;
