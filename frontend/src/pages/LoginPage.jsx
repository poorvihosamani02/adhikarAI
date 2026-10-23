import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDemoMode } from '../context/DemoModeContext';
import { ShieldCheck, LogIn, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, mockLogin, loading, error } = useAuth();
  const { isDemoMode } = useDemoMode();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter your email or citizen ID.');
      return;
    }
    if (!password.trim()) {
      setFormError('Please enter your password.');
      return;
    }

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Authentication failed.');
    }
  };

  const handleMockLogin = () => {
    mockLogin();
    navigate('/dashboard');
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '480px', paddingTop: '3rem' }}>
      <div className="card animate-fade-in" style={{ padding: '2.5rem 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-600), var(--saffron-500))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem', color: 'var(--slate-900)' }}>
            Adhikar<span style={{ color: 'var(--primary-600)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
            Indian Citizen Schemes & Rights Empowerment Portal
          </p>
        </div>

        {/* Practice Notice */}
        <div className="alert alert-info" style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
          <div>
            <strong>Hackathon Practice Build:</strong> Real account credentials and database storage are reserved for your future Node.js backend. Use the 1-click practice login below.
          </div>
        </div>

        {formError && (
          <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Citizen User ID or Email</label>
            <input
              id="email"
              type="text"
              className="form-control"
              placeholder="e.g. rohan.sharma@example.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In via Backend Route'}
          </button>
        </form>

        <div style={{ position: 'relative', textAlign: 'center', margin: '1.5rem 0' }}>
          <div style={{ height: '1px', background: 'var(--slate-200)', width: '100%' }} />
          <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 0.75rem', fontSize: '0.8rem', color: 'var(--slate-400)' }}>
            OR FOR PRACTICE
          </span>
        </div>

        {/* Mock Login Button */}
        <button
          type="button"
          onClick={handleMockLogin}
          className="btn btn-accent"
          style={{ width: '100%' }}
        >
          <Sparkles size={18} />
          <span>One-Click Practice Mock Login</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          Target Backend Route: <code>POST /api/auth/login</code>
        </div>
      </div>
    </div>
  );
}
