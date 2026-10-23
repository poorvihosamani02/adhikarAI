import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ArrowUpRight,
  User,
  LogOut,
  LayoutDashboard,
  Sparkles,
  Search,
  BookOpen,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, switchDemoUser } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleProfileSwitch = (key) => {
    switchDemoUser(key);
  };

  return (
    <>
      {/* Top Prototype Demonstration Notice Bar */}
      <div className="demo-top-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="demo-tag">Prototype Demo</span>
          <span>
            Visual Redesign (Otto Style) &bull; Frontend-Only Preview Mode
          </span>
        </div>
        <div className="demo-quick-switchers">
          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>Switch Citizen:</span>
          <button
            className={`demo-pill-btn ${profile?.name === 'Arun Kumar' ? 'active' : ''}`}
            onClick={() => handleProfileSwitch('SC')}
            title="Switch to Arun Kumar (SC Student, Karnataka)"
          >
            Arun (SC)
          </button>
          <button
            className={`demo-pill-btn ${profile?.name === 'Priya Sharma' ? 'active' : ''}`}
            onClick={() => handleProfileSwitch('OBC')}
            title="Switch to Priya Sharma (OBC Farmer, Maharashtra)"
          >
            Priya (OBC)
          </button>
          <button
            className={`demo-pill-btn ${profile?.name === 'Ramesh Rao' ? 'active' : ''}`}
            onClick={() => handleProfileSwitch('Senior')}
            title="Switch to Ramesh Rao (Senior Citizen, BPL)"
          >
            Ramesh (Sr)
          </button>
        </div>
      </div>

      {/* Main Responsive Header (Otto Style Minimalist) */}
      <header className="navbar">
        <div className="container navbar-container">
          {/* Brand Logo (4-dot geometric mark + clean wordmark) */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="brand-logo"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="brand-dots">
              <div className="brand-dot" />
              <div className="brand-dot" />
              <div className="brand-dot" />
              <div className="brand-dot" />
            </div>
            <div className="brand-title">
              adhikar<span>.ai</span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Cleanly displayed) */}
          <nav className="nav-links">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/find-schemes"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Find My Schemes
            </NavLink>
            <NavLink
              to="/schemes"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              All Schemes
            </NavLink>
            <NavLink
              to="/document-doctor"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Document Doctor
            </NavLink>
            <NavLink
              to="/scam-shield"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Scam Shield
            </NavLink>
          </nav>

          {/* Top-Right Action Area: User Profile & Logout inside a neat rounded box */}
          <div className="nav-actions nav-actions-desktop">
            {isAuthenticated ? (
              <div className="nav-profile-box">
                <Link to="/profile" className="nav-profile-info" title="View Citizen Profile">
                  <div className="nav-avatar-circle">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="nav-profile-name">{user?.name || 'Citizen'}</span>
                  {profile?.category && (
                    <span className="nav-profile-tag">{profile.category}</span>
                  )}
                </Link>

                <button onClick={handleLogout} className="nav-logout-btn" title="Sign Out">
                  <span>Logout</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            ) : (
              <div className="nav-auth-pill">
                <Link to="/login" className="nav-auth-link">
                  Sign In
                </Link>
                <Link to="/login?tab=register" className="nav-auth-btn">
                  <span>Register</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <NavLink
              to="/dashboard"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.75rem 1rem', fontSize: '1.05rem', color: '#ffffff' }}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink
              to="/find-schemes"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.75rem 1rem', fontSize: '1.05rem', color: '#ffffff' }}
            >
              <Sparkles size={18} />
              Find My Schemes
            </NavLink>
            <NavLink
              to="/schemes"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.75rem 1rem', fontSize: '1.05rem', color: '#ffffff' }}
            >
              <Search size={18} />
              All Schemes
            </NavLink>
            <NavLink
              to="/document-doctor"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.75rem 1rem', fontSize: '1.05rem', color: '#ffffff' }}
            >
              <FileCheck2 size={18} />
              Document Doctor
            </NavLink>
            <NavLink
              to="/scam-shield"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.75rem 1rem', fontSize: '1.05rem', color: '#ffffff' }}
            >
              <AlertTriangle size={18} />
              Scam Shield
            </NavLink>
            <NavLink
              to="/profile"
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '0.75rem 1rem', fontSize: '1.05rem', color: '#ffffff' }}
            >
              <User size={18} />
              Citizen Profile
            </NavLink>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="btn btn-primary btn-block"
                style={{ background: '#ffffff', color: 'var(--charcoal-900)' }}
              >
                <span>Logout ({user?.name || 'Citizen'})</span>
                <LogOut size={16} />
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  className="btn btn-outline btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/login?tab=register"
                  className="btn btn-primary btn-block"
                  style={{ background: '#ffffff', color: 'var(--charcoal-900)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Register</span>
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
