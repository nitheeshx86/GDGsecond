// Navbar.jsx
import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <span className="logo-icon">✓</span>
            <span className="logo-text">TaskMaster</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-menu">
          <a href="#home" className="navbar-link active">
            Home
          </a>
          <a href="#todos" className="navbar-link">
            My Tasks
          </a>
          <a href="#completed" className="navbar-link">
            Completed
          </a>
          <a href="#settings" className="navbar-link">
            Settings
          </a>
        </div>

        {/* User Profile Section */}
        <div className="navbar-profile">
          <div className="profile-info">
            <div className="profile-avatar">
              <span>JD</span>
            </div>
            <div className="profile-details">
              <span className="profile-name">John Doe</span>
              <span className="profile-status">5 tasks pending</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <a href="#home" className="mobile-link active" onClick={() => setIsMenuOpen(false)}>
            <span className="link-icon">🏠</span>
            Home
          </a>
          <a href="#todos" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <span className="link-icon">📝</span>
            My Tasks
          </a>
          <a href="#completed" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <span className="link-icon">✅</span>
            Completed
          </a>
          <a href="#settings" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <span className="link-icon">⚙️</span>
            Settings
          </a>
          <div className="mobile-profile">
            <div className="profile-avatar">
              <span>JD</span>
            </div>
            <div className="profile-details">
              <span className="profile-name">John Doe</span>
              <span className="profile-status">5 tasks pending</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;