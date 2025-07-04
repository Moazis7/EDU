import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaListAlt, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
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
          <h1 className="logo-text">MOisPlatform</h1>
        </Link>
      </div>
      <nav className="main-nav">
        <NavLink to="/" className="nav-link" end>
          <FaHome className="nav-icon" /> الرئيسية
        </NavLink>
        <NavLink to="/courses" className="nav-link">
          <FaBook className="nav-icon" /> الكورسات
        </NavLink>
        {user && (
          <NavLink to="/my-courses" className="nav-link">
            <FaListAlt className="nav-icon" /> كورساتي
          </NavLink>
        )}
        {user && user.role === 'admin' && (
          <NavLink to="/admin" className="nav-link">
            <FaUserShield className="nav-icon" /> لوحة المدير
          </NavLink>
        )}
      </nav>
      <div className="auth-buttons">
        {!user && (
          <>
            <Link to="/login" className="auth-btn login-btn">
              <FaSignInAlt /> دخول
            </Link>
            <Link to="/register" className="auth-btn register-btn">
              <FaUserPlus /> تسجيل
            </Link>
          </>
        )}
        {user && (
          <>
            <span className="welcome-user">
              أهلاً يا {user.name}
            </span>
            <button className="auth-btn login-btn" onClick={handleLogout}>
              <FaSignOutAlt /> خروج
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;