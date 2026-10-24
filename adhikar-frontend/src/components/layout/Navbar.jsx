import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';

const Navbar = () => {
  const { user, isAuthenticated, isDemo, logout, switchDemoUser } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [docDropdownOpen, setDocDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  const docDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDocDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (docDropdownRef.current && !docDropdownRef.current.contains(event.target)) {
        setDocDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setDocDropdownOpen(false);
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleProfileSwitch = (key) => {
    switchDemoUser(key);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.firstName ? user.firstName[0].toUpperCase() : 'U');

  const fullName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Citizen');

  const currentPath = location.pathname;
  const isDocActive = currentPath === '/documents' || currentPath === '/document-doctor';
  const isRightsActive = currentPath === '/know-your-rights';

  return (
    <>
      {/* 1. TOP ANNOUNCEMENT / CIVIC STATUS BAR */}
      <div className="announcement">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span className="announcement-dot"></span>
          <span>A clearer way to navigate public benefits</span>
          <span className="announcement-arrow">↗</span>
        </div>

        {/* Quick Demo Demographics Switchers (Preserved for pairing / reviewer demo) */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 600 }}>Demo Profile:</span>
          <button
            type="button"
            className="sample-button"
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              height: 'auto',
              borderRadius: '999px',
              background: isDemo && profile?.name === 'Arun Kumar' ? '#254c3c' : 'rgba(255,255,255,0.7)',
              color: isDemo && profile?.name === 'Arun Kumar' ? '#ffffff' : '#283b25',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => handleProfileSwitch('SC')}
            title="Arun Kumar (SC Student, Karnataka)"
          >
            Arun (SC)
          </button>
          <button
            type="button"
            className="sample-button"
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              height: 'auto',
              borderRadius: '999px',
              background: isDemo && profile?.name === 'Priya Sharma' ? '#254c3c' : 'rgba(255,255,255,0.7)',
              color: isDemo && profile?.name === 'Priya Sharma' ? '#ffffff' : '#283b25',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => handleProfileSwitch('OBC')}
            title="Priya Sharma (OBC Farmer, Maharashtra)"
          >
            Priya (OBC)
          </button>
          <button
            type="button"
            className="sample-button"
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              height: 'auto',
              borderRadius: '999px',
              background: isDemo && profile?.name === 'Ramesh Rao' ? '#254c3c' : 'rgba(255,255,255,0.7)',
              color: isDemo && profile?.name === 'Ramesh Rao' ? '#ffffff' : '#283b25',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => handleProfileSwitch('Senior')}
            title="Ramesh Rao (Senior Citizen, BPL)"
          >
            Ramesh (Sr)
          </button>
        </div>
      </div>

      {/* 2. SITE HEADER */}
      <header className="site-header">
        {/* Brand */}
        <Link className="brand" to={isAuthenticated ? '/dashboard' : '/'} aria-label="AdhikarAI home">
          <span className="brand-mark">
            <span>A</span><i>✦</i>
          </span>
          <span className="brand-copy">
            <strong>adhikar<span>ai</span></strong>
            <small>Citizen empowerment, reimagined</small>
          </span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="menu-toggle"
          id="menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
          aria-controls="main-nav"
          onClick={() => setMobileMenuOpen(prev => !prev)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Main Desktop & Mobile Nav */}
        <nav
          className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}
          id="main-nav"
          aria-label="Main navigation"
        >
          {isAuthenticated ? (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </NavLink>
          ) : (
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
          )}

          <NavLink
            to="/my-schemes"
            className={({ isActive }) => (isActive || location.pathname === '/find-schemes' ? 'active' : '')}
            onClick={() => setMobileMenuOpen(false)}
          >
            My Schemes
          </NavLink>

          <NavLink
            to="/schemes"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore Benefits
          </NavLink>

          {/* Documents Dropdown Menu */}
          <div
            ref={docDropdownRef}
            className={`nav-dropdown ${isDocActive ? 'current-section' : ''} ${docDropdownOpen ? 'open' : ''}`}
          >
            <button
              type="button"
              id="documents-menu-toggle"
              className={`nav-dropdown-toggle ${isDocActive ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={docDropdownOpen}
              aria-controls="documents-dropdown"
              onClick={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(false);
                setDocDropdownOpen(prev => !prev);
              }}
            >
              <span>Documents</span>
              <span className="nav-caret" aria-hidden="true">▾</span>
            </button>

            <div
              className="nav-dropdown-menu"
              id="documents-dropdown"
              aria-labelledby="documents-menu-toggle"
            >
              <Link
                to="/document-doctor"
                className={currentPath === '/document-doctor' ? 'active' : ''}
                onClick={() => {
                  setDocDropdownOpen(false);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="nav-dropdown-icon" aria-hidden="true" style={{ marginRight: '8px' }}>📄</span>
                <span className="nav-dropdown-copy">
                  <strong style={{ display: 'block' }}>Document Doctor</strong>
                  <small style={{ color: '#77786f' }}>Pre-verify document requirements</small>
                </span>
              </Link>

              <Link
                to="/documents"
                className={currentPath === '/documents' ? 'active' : ''}
                onClick={() => {
                  setDocDropdownOpen(false);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="nav-dropdown-icon" aria-hidden="true" style={{ marginRight: '8px' }}>✓</span>
                <span className="nav-dropdown-copy">
                  <strong style={{ display: 'block' }}>Check your document</strong>
                  <small style={{ color: '#77786f' }}>Open document checklist</small>
                </span>
              </Link>
            </div>
          </div>

          <NavLink
            to="/scam-shield"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Stay Protected
          </NavLink>

          <NavLink
            to="/know-your-rights"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Know Your Rights
          </NavLink>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Language selector */}
          <label className="language-select">
            <span className="sr-only">Interface language</span>
            <select
              id="interface-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
          </label>

          {/* Profile Dropdown if Authenticated */}
          {isAuthenticated ? (
            <div className="profile-avatar-wrap" id="profile-avatar-wrap" ref={profileDropdownRef}>
              <button
                className="profile-avatar-btn"
                id="profile-avatar-btn"
                type="button"
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
                aria-controls="profile-dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setDocDropdownOpen(false);
                  setProfileDropdownOpen(prev => !prev);
                }}
              >
                <div className="profile-avatar-img" aria-hidden="true">
                  {initials}
                </div>
                <span className="profile-avatar-name">
                  {fullName.split(' ')[0]}
                </span>
                <span className="profile-avatar-caret">▾</span>
              </button>

              <div
                className={`profile-dropdown ${profileDropdownOpen ? 'open' : ''}`}
                id="profile-dropdown"
                role="menu"
              >
                <div className="pd-head">
                  <div className="pd-avatar-large">
                    {initials}
                  </div>
                  <div>
                    <div className="pd-name">{fullName}</div>
                    <div className="pd-email">{user?.email || 'citizen@adhikar.ai'}</div>
                    <span className="pd-badge">✓ Verified Citizen</span>
                  </div>
                </div>

                <div className="pd-info-grid">
                  <div className="pd-info-item">
                    <small>Gender</small>
                    <strong>{profile?.gender || '—'}</strong>
                  </div>
                  <div className="pd-info-item">
                    <small>Age</small>
                    <strong>{profile?.age ? `${profile.age} yrs` : '—'}</strong>
                  </div>
                  <div className="pd-info-item">
                    <small>State</small>
                    <strong>{profile?.state || '—'}</strong>
                  </div>
                  <div className="pd-info-item">
                    <small>Category</small>
                    <strong>{profile?.category || 'General'}</strong>
                  </div>
                </div>

                <div className="pd-actions">
                  <Link
                    to="/profile"
                    className="pd-action-link"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <span className="pd-icon icon-lilac">👤</span>
                    My Profile
                  </Link>

                  <Link
                    to="/know-your-rights"
                    className="pd-action-link"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <span className="pd-icon icon-mint">✨</span>
                    Ask AdhikarAI
                  </Link>

                  <button
                    type="button"
                    className="pd-action-link logout"
                    onClick={handleLogout}
                    style={{ border: 0, width: '100%', textAlign: 'left', background: 'transparent' }}
                  >
                    <span className="pd-icon" style={{ background: '#fff0ef' }}>🚪</span>
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/login"
                className="text-link"
                style={{ fontSize: '14px', fontWeight: 700 }}
              >
                Sign in
              </Link>
              <Link
                to="/login?tab=register"
                className="button button-dark"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Create account <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
