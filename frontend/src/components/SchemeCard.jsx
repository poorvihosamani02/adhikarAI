import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Award, FileCheck, ArrowRight, CheckCircle2, AlertTriangle, IndianRupee } from 'lucide-react';

export default function SchemeCard({ scheme, showEligibility = false }) {
  const {
    scheme_id,
    scheme_name,
    provider_name,
    jurisdiction,
    category,
    benefit_description,
    benefit_amount,
    benefit_frequency,
    max_family_income,
    required_documents = [],
    demo_match
  } = scheme;

  const categoryColorClass = () => {
    switch (category) {
      case 'scholarship':
        return 'badge-primary';
      case 'women welfare':
        return 'badge-saffron';
      case 'farmer income support':
      case 'health insurance':
        return 'badge-emerald';
      default:
        return 'badge-slate';
    }
  };

  return (
    <div className="card card-interactive animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <span className={`badge ${categoryColorClass()}`}>{category}</span>
          <span className="badge badge-slate" style={{ textTransform: 'uppercase' }}>{jurisdiction}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{scheme_id}</span>
      </div>

      {/* Scheme Title */}
      <h3 style={{ fontSize: '1.15rem', lineHeight: '1.35', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
        {scheme_name}
      </h3>

      {/* Provider Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--slate-600)', marginBottom: '0.85rem' }}>
        <Building2 size={14} color="#64748b" />
        <span>{provider_name || 'Government of India / State Ministry'}</span>
      </div>

      {/* Demo Eligibility Result (If in Find My Schemes) */}
      {showEligibility && demo_match && (
        <div
          style={{
            background: demo_match.is_likely_eligible ? 'var(--emerald-50)' : 'var(--slate-50)',
            border: `1px solid ${demo_match.is_likely_eligible ? 'var(--emerald-100)' : 'var(--slate-200)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            marginBottom: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.85rem', color: demo_match.is_likely_eligible ? 'var(--emerald-700)' : 'var(--slate-700)' }}>
              {demo_match.is_likely_eligible ? <CheckCircle2 size={16} color="#059669" /> : <AlertTriangle size={16} color="#eab308" />}
              {demo_match.is_likely_eligible ? 'Indicative Match' : 'Potential Criteria Review Needed'}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: demo_match.is_likely_eligible ? 'var(--emerald-700)' : 'var(--slate-500)' }}>
              Match Score: {demo_match.match_score}%
            </span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--slate-600)' }}>
            {demo_match.reasons && demo_match.reasons.length > 0 && (
              <div>&bull; {demo_match.reasons[0]}</div>
            )}
            {demo_match.warnings && demo_match.warnings.length > 0 && (
              <div style={{ color: 'var(--saffron-700)' }}>&bull; {demo_match.warnings[0]}</div>
            )}
          </div>
        </div>
      )}

      {/* Benefit summary */}
      <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {benefit_description}
      </p>

      {/* Highlights / Metadata Footer */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <IndianRupee size={13} /> Income Ceiling:
          </span>
          <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
            {max_family_income ? `₹${max_family_income.toLocaleString('en-IN')}/yr` : 'Not restricted in dataset'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FileCheck size={13} /> Required Docs:
          </span>
          <span style={{ fontWeight: 600, color: required_documents.length > 0 ? 'var(--primary-700)' : 'var(--slate-400)' }}>
            {required_documents.length > 0 ? `${required_documents.length} Listed` : 'Not cataloged'}
          </span>
        </div>
      </div>

      {/* Action CTA */}
      <Link
        to={`/schemes/${scheme_id}`}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%', justifyContent: 'space-between' }}
      >
        <span>View Details & Checklist</span>
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
