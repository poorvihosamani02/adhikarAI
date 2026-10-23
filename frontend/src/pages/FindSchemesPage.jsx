import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useDemoMode } from '../context/DemoModeContext';
import { getMyEligibleSchemes } from '../api/schemesApi';
import SchemeCard from '../components/SchemeCard';
import { Compass, UserCheck, AlertCircle, RefreshCw, Filter, Sparkles } from 'lucide-react';

export default function FindSchemesPage() {
  const navigate = useNavigate();
  const { profile, hasProfile } = useProfile();
  const { isDemoMode } = useDemoMode();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLikelyOnly, setFilterLikelyOnly] = useState(false);

  useEffect(() => {
    if (!hasProfile) {
      navigate('/profile?redirect=find-schemes');
      return;
    }

    async function fetchMatches() {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyEligibleSchemes(profile, isDemoMode);
        setSchemes(res.schemes || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch scheme matches from backend route.');
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [hasProfile, profile, isDemoMode, navigate]);

  const displayedSchemes = filterLikelyOnly
    ? schemes.filter((s) => s.demo_match?.is_likely_eligible)
    : schemes;

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Compass size={28} color="#ea580c" />
            <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
              Find My Schemes
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
            Showing evaluated welfare benefits matching your active citizen profile.
          </p>
        </div>

        {/* Profile summary chip */}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', border: '1px solid var(--border-subtle)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>Active Profile: </span>
              <strong>{profile.name || 'Citizen'}</strong> ({profile.category}, ₹{Number(profile.annualIncome).toLocaleString('en-IN')}/yr, {profile.state})
            </div>
            <Link to="/profile" className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
              Edit
            </Link>
          </div>
        )}
      </div>

      {/* Transparent Disclaimer Banner */}
      <div className="alert alert-info" style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
        <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong>Practice Matching Engine:</strong> Results shown below are indicative demo matches derived from actual dataset fields (income caps, state, education). The authoritative eligibility engine will be implemented in your Node.js backend at <code>GET /api/eligibility/my-schemes</code>.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <div>
            <strong>Backend Route Error:</strong> {error}
            <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
              (If testing live mode, ensure your Node.js backend is running on port 3000, or switch back to Demo Mode above.)
            </div>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setFilterLikelyOnly((prev) => !prev)}
            className={`btn btn-sm ${filterLikelyOnly ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Filter size={14} />
            {filterLikelyOnly ? 'Showing Indicative Matches Only' : 'Show All Evaluated Schemes'}
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            {displayedSchemes.length} schemes displayed
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={32} color="#3b82f6" className="animate-spin" style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-700)' }}>Evaluating Scheme Eligibility...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>Matching profile attributes against research criteria</p>
        </div>
      ) : displayedSchemes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AlertCircle size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Matching Schemes Found</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            Try updating your profile details (e.g. state or income level) or toggle the filter to view all available government schemes.
          </p>
          <button onClick={() => setFilterLikelyOnly(false)} className="btn btn-secondary btn-sm">
            Show All Evaluated Schemes
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {displayedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.scheme_id}
              scheme={scheme}
              showEligibility={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
