import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import Badge from '../ui/Badge';

const SchemeCard = ({
  scheme,
  isMatchedView = false,
  onOpenChecklist
}) => {
  const navigate = useNavigate();

  const isVerified = scheme.verification_status === 'verified';
  const benefitAmount = scheme.benefit_amount ? Number(scheme.benefit_amount) : null;
  const isEligible = scheme.is_eligible;

  const formattedBenefit = benefitAmount
    ? `₹${benefitAmount.toLocaleString('en-IN')}`
    : scheme.benefit_amount || 'Benefits as per guidelines';

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        borderLeft: isMatchedView
          ? `5px solid ${isEligible ? 'var(--emerald-500)' : 'var(--danger-500)'}`
          : undefined
      }}
    >
      {/* Top Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <Badge variant={scheme.jurisdiction === 'central' ? 'blue' : 'purple'}>
            {scheme.jurisdiction === 'central' ? 'Central' : scheme.jurisdiction || 'Karnataka'}
          </Badge>
          <Badge variant="slate">
            {scheme.category || 'Welfare'}
          </Badge>
        </div>

        {isMatchedView ? (
          <Badge
            variant={isEligible ? 'emerald' : 'danger'}
            icon={isEligible ? ShieldCheck : AlertTriangle}
          >
            {isEligible ? '100% Eligible' : 'Criteria Unmet'}
          </Badge>
        ) : (
          <Badge
            variant={isVerified ? 'emerald' : 'amber'}
            icon={isVerified ? ShieldCheck : AlertTriangle}
          >
            {isVerified ? 'Verified' : 'Needs Review'}
          </Badge>
        )}
      </div>

      {/* Scheme Title */}
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--charcoal-900)',
          marginBottom: '0.4rem',
          lineHeight: 1.3
        }}
      >
        <Link to={`/schemes/${scheme.scheme_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {scheme.scheme_name}
        </Link>
      </h3>

      {/* Provider Ministry */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--charcoal-500)', marginBottom: '1rem' }}>
        {scheme.provider_name}
      </div>

      {/* Benefit Highlight Box */}
      <div
        style={{
          background: 'var(--charcoal-50)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          border: '1px solid var(--charcoal-100)',
          marginBottom: '1rem'
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--charcoal-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Financial Entitlement
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--emerald-600)', display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.15rem' }}>
          {formattedBenefit}
          {scheme.benefit_frequency && (
            <span style={{ fontSize: '0.8rem', color: 'var(--charcoal-500)', fontWeight: 600 }}>
              / {scheme.benefit_frequency}
            </span>
          )}
        </div>
      </div>

      {/* Description Snippet */}
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--charcoal-600)',
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.55
        }}
      >
        {scheme.benefit_description}
      </p>

      {/* Matched vs Unmet Criteria (if in Find Schemes View) */}
      {isMatchedView && (
        <div style={{ marginBottom: '1.25rem', fontSize: '0.8125rem' }}>
          {isEligible ? (
            <div style={{ color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <ShieldCheck size={16} /> All {scheme.matched_criteria?.length || 4} profile conditions fully satisfied
            </div>
          ) : (
            <div style={{ color: 'var(--danger-600)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontWeight: 600 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{scheme.unmet_criteria?.[0] || 'Profile criteria not satisfied.'}</span>
            </div>
          )}
        </div>
      )}

      {/* Card Actions Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--charcoal-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => navigate(`/schemes/${scheme.scheme_id}`)}
          style={{
            background: 'var(--charcoal-100)',
            border: 'none',
            color: 'var(--charcoal-900)',
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          View Details
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {onOpenChecklist && (
            <button
              type="button"
              onClick={() => onOpenChecklist(scheme)}
              style={{
                background: 'transparent',
                border: '1.5px solid var(--charcoal-200)',
                color: 'var(--charcoal-700)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="View Required Documents"
            >
              <FileText size={14} />
              <span>Docs</span>
            </button>
          )}

          {scheme.application_url && (
            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--coral-600)',
                color: '#ffffff',
                padding: '0.45rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="Apply on Official Portal"
            >
              <span>Apply</span>
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;
