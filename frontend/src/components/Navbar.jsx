import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import {
  ShieldCheck,
  Search,
  FileText,
  AlertTriangle,
  MessageSquare,
  User,
  LogOut,
  LogIn,
  LayoutDashboard,
  Compass
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-link">
          <div className="brand-logo">
            <ShieldCheck size={22} />
          </div>
          <div className="brand-text">
            Adhikar<span>AI</span>
          </div>
        </Link>

        <nav>
          <ul className="nav-menu">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/find-schemes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Compass size={16} /> Find My Schemes
              </NavLink>
            </li>
            <li>
              <NavLink to="/schemes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Search size={16} /> All Schemes
              </NavLink>
            </li>
            <li>
              <NavLink to="/document-doctor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={16} /> Document Doctor
              </NavLink>
            </li>
            <li>
              <NavLink to="/scam-shield" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <AlertTriangle size={16} /> Scam Shield
              </NavLink>
            </li>
            <li>
              <NavLink to="/know-your-rights" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <MessageSquare size={16} /> Know Your Rights
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" className="btn btn-secondary btn-sm" title="Citizen Profile">
                <User size={15} />
                <span>{user.name ? user.name.split(' ')[0] : 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn size={15} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
