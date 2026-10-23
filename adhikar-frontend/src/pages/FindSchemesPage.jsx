import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  User,
  Filter,
  CheckCircle2,
  XCircle,
  FileCheck2,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  UserCheck
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { mockSchemesService } from '../data/mockService';
import Badge from '../components/ui/Badge';
import DocumentChecklistModal from '../components/schemes/DocumentChecklistModal';

const FindSchemesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { profile, hasProfile } = useProfile();

  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedCriteriaSchemeId, setExpandedCriteriaSchemeId] = useState(null);

  // Modal
  const [activeChecklistSchemeId, setActiveChecklistSchemeId] = useState(null);

  useEffect(() => {
    setLoading(true);
    mockSchemesService
      .evaluateMatchedSchemes(profile)
      .then((res) => {
        setEvaluationResult(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [profile]);

  const toggleCriteriaAccordion = (schemeId) => {
    setExpandedCriteriaSchemeId(expandedCriteriaSchemeId === schemeId ? null : schemeId);
  };

  const displayedSchemes = useMemo(() => {
    if (!evaluationResult?.schemes) return [];

    return evaluationResult.schemes.filter((s) => {
      if (statusFilter === 'eligible' && !s.is_eligible) return false;
      if (statusFilter === 'ineligible' && s.is_eligible) return false;

      if (categoryFilter !== 'all') {
        if ((s.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [evaluationResult, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    if (!evaluationResult?.schemes) return [];
    const set = new Set();
    evaluationResult.schemes.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [evaluationResult]);

  // If no profile exists
  if (!loading && (!hasProfile || !profile)) {
    return (
      <div className="container" style={{ maxWidth: '640px', marginTop: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', borderRadius: 'var(--radius-xl)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--coral-50)',
              color: 'var(--coral-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <UserCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--charcoal-900)', marginBottom: '0.75rem' }}>
            Citizen Profile Required
          </h2>
          <p style={{ color: 'var(--charcoal-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            To evaluate your eligibility across all 20 welfare schemes, the AdhikarAI matching engine requires your age, state,
            caste category, and income.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/profile?redirect=find-schemes')}
            style={{ background: 'var(--coral-600)', color: '#ffffff' }}
          >
            <span>Complete Profile Now</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const summary = evaluationResult?.summary;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Citizen Evaluation Summary Header */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--charcoal-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active Citizen Profile Evaluated
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--charcoal-900)', margin: '0.2rem 0' }}>
            {profile?.name} &bull; {profile?.age} Yrs &bull; {profile?.state}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span className="badge badge-blue">{profile?.category}</span>
            <span className="badge badge-emerald">₹{Number(profile?.annual_income || 0).toLocaleString('en-IN')} / Yr</span>
            <span className="badge badge-slate">{profile?.education_level || 'Undergraduate'}</span>
            {profile?.is_bpl && <span className="badge badge-saffron">BPL Household</span>}
            {profile?.is_minority && <span className="badge badge-purple">Minority Community</span>}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/profile?redirect=find-schemes')}
          style={{
            background: 'var(--charcoal-100)',
            border: 'none',
            color: 'var(--charcoal-900)',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span>Update Values</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* 2. Match Scoreboard Banner (Minimalist High-Contrast) */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          color: 'var(--charcoal-900)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div>
          <span className="eyebrow-text" style={{ color: 'var(--coral-600)', marginBottom: '0.35rem' }}>
            ELIGIBILITY SCOREBOARD
          </span>
          <div style={{ fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
            {summary ? summary.matched_count : 7} Schemes Matched.
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--charcoal-600)', marginTop: '0.5rem' }}>
            Out of {summary ? summary.total_schemes_evaluated : 20} cataloged government programs evaluated against your profile.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: 'var(--emerald-50)', border: '1px solid #bbf7d0', padding: '1.15rem 1.75rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--emerald-600)', letterSpacing: '-0.04em' }}>
              {summary ? summary.matched_count : 7}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--emerald-700)', fontWeight: 700, letterSpacing: '0.06em' }}>
              100% Eligible
            </div>
          </div>

          <div style={{ textAlign: 'center', background: 'var(--charcoal-50)', border: '1px solid var(--charcoal-200)', padding: '1.15rem 1.75rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--charcoal-700)', letterSpacing: '-0.04em' }}>
              {summary ? summary.ineligible_count : 13}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--charcoal-500)', fontWeight: 700, letterSpacing: '0.06em' }}>
              Criteria Unmet
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls (Pill buttons) */}
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--charcoal-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={15} /> Show:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              background: statusFilter === 'all' ? 'var(--coral-600)' : 'var(--charcoal-100)',
              color: statusFilter === 'all' ? '#ffffff' : 'var(--charcoal-800)',
              border: 'none',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            All Evaluated ({evaluationResult?.schemes?.length || 20})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('eligible')}
            style={{
              background: statusFilter === 'eligible' ? 'var(--emerald-600)' : 'var(--charcoal-100)',
              color: statusFilter === 'eligible' ? '#ffffff' : 'var(--charcoal-800)',
              border: 'none',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            100% Eligible Only ({summary ? summary.matched_count : 7})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ineligible')}
            style={{
              background: statusFilter === 'ineligible' ? 'var(--charcoal-800)' : 'var(--charcoal-100)',
              color: statusFilter === 'ineligible' ? '#ffffff' : 'var(--charcoal-800)',
              border: 'none',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Criteria Unmet ({summary ? summary.ineligible_count : 13})
          </button>
        </div>

        <div>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '160px', padding: '0.45rem 0.85rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Schemes List with Accordion */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#ffffff' }}>
          Evaluating citizen profile against welfare criteria...
        </div>
      ) : displayedSchemes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedSchemes.map((scheme) => {
            const isEligible = scheme.is_eligible;
            const isExpanded = expandedCriteriaSchemeId === scheme.scheme_id;
            const benefitAmount = scheme.benefit_amount ? Number(scheme.benefit_amount) : null;

            return (
              <div
                key={scheme.scheme_id}
                className="card"
                style={{
                  borderLeft: `5px solid ${isEligible ? 'var(--emerald-500)' : 'var(--danger-500)'}`,
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${scheme.jurisdiction === 'central' ? 'badge-blue' : 'badge-purple'}`}>
                        {scheme.jurisdiction === 'central' ? 'Central Scheme' : 'Karnataka State'}
                      </span>
                      <span className="badge badge-slate">{scheme.category}</span>
                      <span className={`badge ${isEligible ? 'badge-emerald' : 'badge-danger'}`}>
                        {isEligible ? '100% Eligible' : 'Criteria Unmet'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
                      <Link to={`/schemes/${scheme.scheme_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {scheme.scheme_name}
                      </Link>
                    </h3>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-500)' }}>
                      {scheme.provider_name}
                    </div>
                  </div>

                  {/* Benefit Callout */}
                  <div style={{ textAlign: 'right', minWidth: '160px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--charcoal-500)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>
                      Entitlement Value
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--emerald-600)' }}>
                      {benefitAmount ? `₹${benefitAmount.toLocaleString('en-IN')}` : scheme.benefit_amount || 'Benefits Included'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--charcoal-600)', margin: 0, lineHeight: 1.6 }}>
                  {scheme.benefit_description}
                </p>

                {/* Criteria Accordion Button */}
                <button
                  type="button"
                  onClick={() => toggleCriteriaAccordion(scheme.scheme_id)}
                  style={{
                    background: 'var(--charcoal-50)',
                    border: '1px solid var(--charcoal-100)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: isEligible ? 'var(--emerald-600)' : 'var(--danger-600)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isEligible ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    {isEligible
                      ? `Why You Match (${scheme.matched_criteria?.length || 4} Rules Satisfied)`
                      : `View Unmet Requirements (${scheme.unmet_criteria?.length || 1} Mismatch)`}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Accordion Expand Body */}
                {isExpanded && (
                  <div
                    style={{
                      background: 'var(--charcoal-50)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem 1.5rem',
                      border: '1px solid var(--charcoal-200)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    {/* Satisfied Criteria */}
                    {scheme.matched_criteria && scheme.matched_criteria.length > 0 && (
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--emerald-700)', marginBottom: '0.4rem' }}>
                          Satisfied Conditions:
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {scheme.matched_criteria.map((c, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--charcoal-800)' }}>
                              <CheckCircle2 size={16} style={{ color: 'var(--emerald-600)', flexShrink: 0, marginTop: '2px' }} />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Unmet Criteria */}
                    {scheme.unmet_criteria && scheme.unmet_criteria.length > 0 && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--charcoal-300)' }}>
                        <div style={{ fontWeight: 800, color: 'var(--danger-700)', marginBottom: '0.4rem' }}>
                          Unmet Conditions:
                        </div>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {scheme.unmet_criteria.map((u, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--danger-700)' }}>
                              <XCircle size={16} style={{ color: 'var(--danger-600)', flexShrink: 0, marginTop: '2px' }} />
                              <span>{u}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Actions Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--charcoal-100)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/schemes/${scheme.scheme_id}`)}
                    style={{
                      background: 'var(--charcoal-100)',
                      border: 'none',
                      color: 'var(--charcoal-900)',
                      padding: '0.5rem 1.15rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Scheme Details
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setActiveChecklistSchemeId(scheme.scheme_id)}
                      style={{
                        background: 'transparent',
                        border: '1.5px solid var(--charcoal-200)',
                        color: 'var(--charcoal-800)',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <FileCheck2 size={15} />
                      <span>Required Documents</span>
                    </button>

                    {scheme.application_url && (
                      <a
                        href={scheme.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'var(--coral-600)',
                          color: '#ffffff',
                          padding: '0.5rem 1.15rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <span>Apply on Portal</span>
                        <ArrowUpRight size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--charcoal-500)' }}>
          No schemes match the selected filter options.
        </div>
      )}

      {/* Document Checklist Modal */}
      <DocumentChecklistModal
        schemeId={activeChecklistSchemeId}
        isOpen={!!activeChecklistSchemeId}
        onClose={() => setActiveChecklistSchemeId(null)}
      />
    </div>
  );
};

export default FindSchemesPage;
