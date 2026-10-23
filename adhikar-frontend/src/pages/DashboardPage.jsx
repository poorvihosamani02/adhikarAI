import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Compass,
  FileCheck2,
  BookOpen,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { schemesApi } from '../api/schemesApi';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, hasProfile } = useProfile();
  const [matchSummary, setMatchSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setLoading(true);
      schemesApi
        .getMatchedSchemes(profile)
        .then((res) => setMatchSummary(res?.summary || null))
        .catch((err) => console.error('Failed to load dashboard match summary:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  // Calculate profile completeness
  const profileFields = ['age', 'gender', 'state', 'category', 'annual_income', 'education_level', 'occupation'];
  const filledCount = profile ? profileFields.filter((f) => profile[f] !== undefined && profile[f] !== '').length : 0;
  const completenessPercent = Math.round((filledCount / profileFields.length) * 100);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Welcome Hero Banner (Otto Inspired) */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          color: 'var(--charcoal-900)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.75rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <span className="badge badge-saffron">
              CITIZEN LAUNCHPAD
            </span>
            {profile?.category && (
              <span className="badge badge-slate">
                {profile.category} &bull; {profile.state || 'Karnataka'}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--charcoal-900)', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
            Namaste, {user?.name || profile?.name || 'Citizen'}.
          </h1>
          <p style={{ color: 'var(--charcoal-600)', fontSize: '1.05rem', lineHeight: 1.55 }}>
            Welcome to your personalized AdhikarAI civic space. Discover welfare scheme matches, verify documents, and explore statutory rights.
          </p>

          {/* Profile Completeness Bar */}
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '130px',
                  height: '8px',
                  background: 'var(--charcoal-100)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${completenessPercent}%`,
                    height: '100%',
                    background: completenessPercent === 100 ? 'var(--emerald-500)' : 'var(--coral-600)',
                    borderRadius: 'var(--radius-full)'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)', fontWeight: 600 }}>
                Profile: <strong>{completenessPercent}% Complete</strong>
              </span>
            </div>
            <Link to="/profile" style={{ fontSize: '0.8125rem', color: 'var(--coral-600)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <span>Edit Profile</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/find-schemes')}
            style={{
              background: 'var(--coral-600)',
              color: '#ffffff',
              padding: '0.9rem 1.85rem',
              fontSize: '1rem'
            }}
          >
            <span>Find My Eligible Schemes</span>
            <ArrowUpRight size={18} />
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/schemes')}
            style={{
              background: 'var(--charcoal-100)',
              color: 'var(--charcoal-900)',
              padding: '0.85rem 1.75rem',
              fontSize: '0.95rem'
            }}
          >
            <span>Browse All 20 Schemes</span>
          </button>
        </div>
      </div>

      {/* 2. Key Statistics Row */}
      <div className="grid-4">
        <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
            01 &bull; Cataloged Schemes
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--charcoal-900)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
            20
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
            Available for matching
          </div>
        </div>

        <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
            02 &bull; Matched For You
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--emerald-600)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
            {loading ? '...' : matchSummary ? matchSummary.matched_count : '7'}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
            {hasProfile ? '100% criteria satisfied' : 'Complete profile to view'}
          </div>
        </div>

        <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
            03 &bull; Document Rules
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--charcoal-900)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
            30
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
            Official acceptance tests
          </div>
        </div>

        <div className="card card-hover" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--charcoal-500)' }}>
            04 &bull; Monitored Scams
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--charcoal-900)', margin: '0.2rem 0', letterSpacing: '-0.04em' }}>
            22
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-600)' }}>
            Active cyber-fraud heuristics
          </div>
        </div>
      </div>

      {/* 3. Official Gazette Notice Banner */}
      <Alert variant="warning" title="Government Gazette Verification Notice">
        19 of 20 cataloged welfare schemes carry <code>verification_status="needs_review"</code> based on open data
        records. While benefit and eligibility formulas are verified against historical data, always confirm current
        academic year deadlines on designated official portals like{' '}
        <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 700 }}>
          scholarships.gov.in
        </a>.
      </Alert>

      {/* 4. Specialized Civic AI Tools */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <span className="eyebrow-text">QUICK ACCESS</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
            Specialized Civic AI Assistants
          </h2>
        </div>

        <div className="grid-3">
          {/* Tool 1 */}
          <div className="card card-hover" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileCheck2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Document Doctor</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-600)', lineHeight: 1.55, marginBottom: '1.5rem', flex: 1 }}>
              Inspect income certificates, caste declarations, or Aadhaar credentials before applying to avoid bureaucratic rejection.
            </p>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => navigate('/document-doctor')}
              style={{ background: 'var(--coral-600)', color: '#ffffff' }}
            >
              <span>Pre-Verify Documents</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Tool 2 */}
          <div className="card card-hover" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <BookOpen size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Legal Rights AI</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-600)', lineHeight: 1.55, marginBottom: '1.5rem', flex: 1 }}>
              Ask statutory questions on RTI Online, NALSA free legal aid eligibility, and cybercrime reporting with citations.
            </p>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => navigate('/know-your-rights')}
              style={{ background: 'var(--coral-600)', color: '#ffffff' }}
            >
              <span>Consult Legal AI</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Tool 3 */}
          <div className="card card-hover" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Scam Shield</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-600)', lineHeight: 1.55, marginBottom: '1.5rem', flex: 1 }}>
              Analyze suspicious power bill disconnection SMS messages, fake scholarship APKs, or lottery phishing claims.
            </p>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => navigate('/scam-shield')}
              style={{ background: 'var(--coral-600)', color: '#ffffff' }}
            >
              <span>Scan Suspicious Message</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
