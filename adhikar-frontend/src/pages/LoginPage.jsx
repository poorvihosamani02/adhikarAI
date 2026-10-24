import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROFILES } from '../data/mockProfiles';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, switchDemoUser } = useAuth();

  const query = new URLSearchParams(location.search);
  const initialTab = query.get('tab') === 'register' ? 'signup' : 'login';
  const redirectPath = query.get('redirect') ? `/${query.get('redirect')}` : '/dashboard';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields mapped to backend
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'register') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [location.search]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(signupName, signupEmail, signupPassword);
      setSuccessMsg('Account created successfully! Signing in...');
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (profileKey) => {
    switchDemoUser(profileKey);
    navigate(redirectPath);
  };

  return (
    <div className="auth-page">
      {/* =====================================================
           LEFT PANEL: Civic Branding & Mission
      ====================================================== */}
      <div className="auth-left">
        <Link className="auth-brand brand" to="/">
          <span className="brand-mark">
            <span>A</span><i>✦</i>
          </span>
          <span className="brand-copy">
            <strong>adhikar<span>ai</span></strong>
            <small>Citizen empowerment, reimagined</small>
          </span>
        </Link>

        <div className="auth-hero-text">
          <h2>
            What you're entitled to should never be <em>hard to find.</em>
          </h2>
          <p>
            Government benefits, scholarships, documents and rights — made easier to discover, understand and act on. One citizen account to access all of it.
          </p>
        </div>

        <div className="auth-features">
          <div className="auth-feature">
            <span className="auth-feature-icon">🌾</span>
            Discover 20+ national and state welfare schemes
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">📄</span>
            Build your document checklist before applying
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">🛡️</span>
            Spot red flags in suspicious benefit messages
          </div>
          <div className="auth-feature">
            <span className="auth-feature-icon">⚖️</span>
            Know your rights — RTI, consumer protection, legal aid
          </div>
        </div>

        {/* Quick Demo Switchers notice */}
        <div style={{ marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', color: '#c0d5b0', marginBottom: '8px' }}>
            DEMO TESTING ACCESS
          </div>
          <p style={{ color: '#c4cec2', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
            Switch directly to simulated citizen profiles using the demo pills on the right to test different categories and states.
          </p>
        </div>
      </div>

      {/* =====================================================
           RIGHT PANEL: Auth Card Form
      ====================================================== */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              id="login-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              onClick={() => handleTabSwitch('login')}
            >
              Sign in
            </button>
            <button
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              id="signup-tab"
              type="button"
              role="tab"
              aria-selected={activeTab === 'signup'}
              onClick={() => handleTabSwitch('signup')}
            >
              Create account
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div
              className="auth-error show"
              role="alert"
              style={{ marginBottom: '16px' }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#e1f1e3',
                color: '#254c3c',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px'
              }}
              role="status"
            >
              ✓ {successMsg}
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          {activeTab === 'login' && (
            <div id="login-form">
              <h3>Welcome back</h3>
              <p>Sign in to continue your civic journey.</p>

              <form onSubmit={handleLoginSubmit} autoComplete="off">
                <div className="auth-field">
                  <label htmlFor="login-email">Email address</label>
                  <input
                    type="email"
                    id="login-email"
                    placeholder="you@example.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="login-password">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', color: '#77786f', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    placeholder="Your password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  id="login-submit"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in →'}
                </button>
              </form>

              {/* DEMO PROFILES QUICK ACCESS */}
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e8e4dc' }}>
                <span className="tiny-label" style={{ display: 'block', marginBottom: '8px' }}>
                  QUICK ONE-CLICK DEMO PROFILES
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    className="sample-button"
                    style={{ textAlign: 'left', padding: '8px 10px' }}
                    onClick={() => handleDemoLogin('SC')}
                  >
                    <strong>Arun Kumar</strong>
                    <small style={{ display: 'block', color: '#77786f' }}>SC • Student (KA)</small>
                  </button>

                  <button
                    type="button"
                    className="sample-button"
                    style={{ textAlign: 'left', padding: '8px 10px' }}
                    onClick={() => handleDemoLogin('OBC')}
                  >
                    <strong>Priya Sharma</strong>
                    <small style={{ display: 'block', color: '#77786f' }}>OBC • Farmer (MH)</small>
                  </button>

                  <button
                    type="button"
                    className="sample-button"
                    style={{ textAlign: 'left', padding: '8px 10px' }}
                    onClick={() => handleDemoLogin('Senior')}
                  >
                    <strong>Ramesh Rao</strong>
                    <small style={{ display: 'block', color: '#77786f' }}>Senior • BPL (KA)</small>
                  </button>

                  <button
                    type="button"
                    className="sample-button"
                    style={{ textAlign: 'left', padding: '8px 10px' }}
                    onClick={() => handleDemoLogin('ST')}
                  >
                    <strong>Sunita Devi</strong>
                    <small style={{ display: 'block', color: '#77786f' }}>ST • SHG Leader</small>
                  </button>
                </div>
              </div>

              <div className="auth-switch">
                Don't have an account?{' '}
                <a
                  href="#signup"
                  id="go-signup"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabSwitch('signup');
                  }}
                >
                  Create one
                </a>
              </div>
            </div>
          )}

          {/* ================= SIGNUP FORM ================= */}
          {activeTab === 'signup' && (
            <div id="signup-form">
              <h3>Create your account</h3>
              <p>Join AdhikarAI — your everyday civic companion.</p>

              <form onSubmit={handleSignupSubmit} autoComplete="off">
                <div className="auth-field">
                  <label htmlFor="signup-name">Full name</label>
                  <input
                    type="text"
                    id="signup-name"
                    placeholder="e.g. Ramesh Kumar"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-email">Email address</label>
                  <input
                    type="email"
                    id="signup-email"
                    placeholder="you@example.com"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    type="password"
                    id="signup-password"
                    placeholder="At least 6 characters"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit"
                  id="signup-submit"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>

              <div className="auth-switch">
                Already have an account?{' '}
                <a
                  href="#login"
                  id="go-login"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabSwitch('login');
                  }}
                >
                  Sign in
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
