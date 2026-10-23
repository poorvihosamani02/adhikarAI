import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROFILES } from '../data/mockProfiles';
import Alert from '../components/ui/Alert';

// Google 'G' official logo SVG matching Reference Picture 3
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.39 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, switchDemoUser } = useAuth();

  const query = new URLSearchParams(location.search);
  const initialTab = query.get('tab') === 'register' ? 'register' : 'login';
  const redirectPath = query.get('redirect') ? `/${query.get('redirect')}` : '/dashboard';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields mapped to backend
  const [loginEmail, setLoginEmail] = useState('arun.kumar@example.com');
  const [loginPassword, setLoginPassword] = useState('Password@123');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    if (query.get('tab') === 'register') {
      setActiveTab('register');
    }
  }, [location.search]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      setSuccessMsg('Authentication successful! Navigating to dashboard...');
      setTimeout(() => {
        navigate(redirectPath);
      }, 350);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(regName, regEmail, regPassword);
      setSuccessMsg(res.message || 'Account created successfully! Please sign in.');
      setLoginEmail(regEmail);
      setActiveTab('login');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (profile) => {
    switchDemoUser(profile.category);
    navigate(redirectPath);
  };

  return (
    <div className="container" style={{ maxWidth: '980px', marginTop: '2rem', marginBottom: '2rem' }}>
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1.15fr) 1fr',
          borderRadius: '28px',
          boxShadow: '0 20px 50px -10px rgba(70, 45, 25, 0.12)',
          border: '1px solid rgba(139, 115, 85, 0.16)',
          background: '#ffffff'
        }}
      >
        {/* Left Side: Minimalist Clean Form matching Picture 3 */}
        <div
          style={{
            padding: '3.5rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Top App Icon */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                }}
              />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--charcoal-900)',
              letterSpacing: '-0.03em',
              marginBottom: '0.4rem'
            }}
          >
            {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--charcoal-500)',
              marginBottom: '2rem'
            }}
          >
            {activeTab === 'login'
              ? 'Welcome back! Please enter your details.'
              : 'Enter your credentials to access your citizen profile.'}
          </p>

          {errorMsg && (
            <Alert variant="danger" onClose={() => setErrorMsg('')}>
              {errorMsg}
            </Alert>
          )}

          {successMsg && (
            <Alert variant="success" onClose={() => setSuccessMsg('')}>
              {successMsg}
            </Alert>
          )}

          {/* FORM: Sign In */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email Field */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--charcoal-800)',
                    marginBottom: '0.45rem'
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(139, 115, 85, 0.22)',
                    fontSize: '0.95rem',
                    color: 'var(--charcoal-900)',
                    background: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--coral-500)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(216, 109, 78, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(139, 115, 85, 0.22)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--charcoal-800)',
                    marginBottom: '0.45rem'
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.8rem 0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(139, 115, 85, 0.22)',
                      fontSize: '0.95rem',
                      color: 'var(--charcoal-900)',
                      background: '#ffffff',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--coral-500)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(216, 109, 78, 0.12)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(139, 115, 85, 0.22)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--charcoal-400)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember for 30 days & Forgot Password Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--charcoal-700)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#7c3aed', width: '16px', height: '16px' }}
                  />
                  <span>Remember for 30 days</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Demo mode: please use Password@123 or one-click demo profiles.');
                  }}
                  style={{
                    color: '#7c3aed',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Forgot password
                </a>
              </div>

              {/* Primary Sign In Button (Picture 3 style) */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '12px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(124, 58, 237, 0.28)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#6d28d9')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#7c3aed')}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* Secondary Sign In with Google Button */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(DEMO_PROFILES[0])}
                style={{
                  width: '100%',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: 'var(--charcoal-800)',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  border: '1.5px solid rgba(139, 115, 85, 0.22)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#faf6f2')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                <GoogleIcon />
                <span>Sign in with Google</span>
              </button>

              {/* Bottom Sign Up Link */}
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: 'var(--charcoal-500)',
                  marginTop: '0.75rem'
                }}
              >
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7c3aed',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign up
                </button>
              </div>

              {/* Quick Demo Citizens Switcher */}
              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(139, 115, 85, 0.14)',
                  fontSize: '0.78rem',
                  color: 'var(--charcoal-500)'
                }}
              >
                <div style={{ marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quick 1-Click Demo Profiles:
                </div>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {DEMO_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(p)}
                      style={{
                        background: '#faf6f2',
                        border: '1px solid rgba(139, 115, 85, 0.18)',
                        borderRadius: '9999px',
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--charcoal-800)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--coral-50)';
                        e.currentTarget.style.color = 'var(--coral-600)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = '#faf6f2';
                        e.currentTarget.style.color = 'var(--charcoal-800)';
                      }}
                    >
                      {p.name} ({p.category})
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* FORM: Register */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--charcoal-800)', marginBottom: '0.45rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Arun Kumar"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(139, 115, 85, 0.22)',
                    fontSize: '0.95rem',
                    color: 'var(--charcoal-900)',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--charcoal-800)', marginBottom: '0.45rem' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(139, 115, 85, 0.22)',
                    fontSize: '0.95rem',
                    color: 'var(--charcoal-900)',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--charcoal-800)', marginBottom: '0.45rem' }}>
                  Password (Min 8 Characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.8rem 0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1.5px solid rgba(139, 115, 85, 0.22)',
                      fontSize: '0.95rem',
                      color: 'var(--charcoal-900)',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.9rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--charcoal-400)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '12px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(124, 58, 237, 0.28)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem'
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <div
                style={{
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: 'var(--charcoal-500)',
                  marginTop: '0.75rem'
                }}
              >
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7c3aed',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Elegant Glassmorphism Aesthetic Matching Reference 3 */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 40%, #ddd6fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem'
          }}
        >
          {/* Abstract Lens & Fluid Rings from Reference Picture 3 */}
          <div
            style={{
              position: 'absolute',
              width: '380px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, rgba(147, 51, 234, 0.45) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 80%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }}
          />

          <div
            style={{
              position: 'relative',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.7)',
              boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.5), 0 20px 40px rgba(124, 58, 237, 0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '2rem'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                boxShadow: '0 10px 24px rgba(124, 58, 237, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                marginBottom: '1rem'
              }}
            >
              <div className="brand-dots" style={{ transform: 'scale(1.2)' }}>
                <div className="brand-dot" style={{ backgroundColor: '#ffffff' }} />
                <div className="brand-dot" style={{ backgroundColor: '#ffffff' }} />
                <div className="brand-dot" style={{ backgroundColor: '#ffffff' }} />
                <div className="brand-dot" style={{ backgroundColor: '#ffffff' }} />
              </div>
            </div>

            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e1b4b', letterSpacing: '-0.02em' }}>
              adhikar.ai
            </div>
            <div style={{ fontSize: '0.8rem', color: '#4338ca', marginTop: '0.35rem', fontWeight: 500 }}>
              Citizen Entitlements &amp; Statutory Protection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
