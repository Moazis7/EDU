import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaHome, FaBook, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUserShield, FaListAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <Link to="/">
          <FaGraduationCap className="logo-icon" />
          EduPlatform
        </Link>
      </div>
      <nav className="main-nav">
        <NavLink to="/" className="nav-link" end>
          <FaHome className="nav-icon" /> Home
        </NavLink>
        <NavLink to="/courses" className="nav-link">
          <FaBook className="nav-icon" /> Courses
        </NavLink>
        {user && (
          <NavLink to="/my-courses" className="nav-link">
            <FaListAlt className="nav-icon" /> My Courses
          </NavLink>
        )}
        {user && user.role === 'admin' && (
          <NavLink to="/admin" className="nav-link">
            <FaUserShield className="nav-icon" /> Admin
          </NavLink>
        )}
      </nav>
      <div className="auth-buttons">
        {!user && (
          <>
            <Link to="/login" className="auth-btn login-btn">
              <FaSignInAlt /> Login
            </Link>
            <Link to="/register" className="auth-btn register-btn">
              <FaUserPlus /> Register
            </Link>
          </>
        )}
        {user && (
          <>
            <span className="welcome-user" style={{marginRight: 12, fontWeight: 600, color: '#5a4fcf'}}>
              Welcome, {user.name}
            </span>
            <button className="auth-btn login-btn" onClick={handleLogout} style={{minWidth: 110}}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header; 