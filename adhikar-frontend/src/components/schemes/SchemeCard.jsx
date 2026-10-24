import React from 'react';
import { Link } from 'react-router-dom';

const SchemeCard = ({
  scheme,
  isMatchedView = false,
  onOpenChecklist
}) => {
  const isVerified = scheme.verification_status === 'verified';
  const benefitAmount = scheme.benefit_amount ? Number(scheme.benefit_amount) : null;
  const isEligible = scheme.is_eligible;

  const formattedBenefit = benefitAmount
    ? `₹${benefitAmount.toLocaleString('en-IN')}`
    : scheme.benefit_amount || 'Benefits as per guidelines';

  const categoryTag = scheme.category || 'Welfare';
  const jurisdictionTag = scheme.jurisdiction === 'central' ? 'Central Government' : scheme.jurisdiction || 'State Scheme';

  return (
    <article
      className="scheme-card"
      style={{
        borderLeft: isMatchedView
          ? `4px solid ${isEligible ? '#254c3c' : '#dc2626'}`
          : undefined
      }}
    >
      {/* Category and Verification Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className="scheme-tag">
            {jurisdictionTag}
          </span>
          <span
            className="scheme-tag"
            style={{
              background: '#eeebff',
              borderColor: '#ded3fa',
              color: '#44317a'
            }}
          >
            {categoryTag}
          </span>
        </div>

        {isMatchedView ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '999px',
              background: isEligible ? '#e1f1e3' : '#fff0ef',
              color: isEligible ? '#254c3c' : '#c93b2b'
            }}
          >
            {isEligible ? '✓ 100% Match' : '⚠ Criteria Unmet'}
          </span>
        ) : (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '999px',
              background: isVerified ? '#e1f1e3' : '#fff0e7',
              color: isVerified ? '#254c3c' : '#b07050'
            }}
          >
            {isVerified ? '✓ Verified' : 'Official Portal'}
          </span>
        )}
      </div>

      {/* Scheme Title */}
      <h4>
        <Link to={`/schemes/${scheme.scheme_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {scheme.scheme_name}
        </Link>
      </h4>

      {/* Provider Ministry */}
      <div style={{ fontSize: '12px', color: '#77786f', marginBottom: '12px', fontWeight: 500 }}>
        {scheme.provider_name}
      </div>

      {/* Benefit Highlight Box */}
      <div
        style={{
          width: '100%',
          background: '#faf8f3',
          border: '1px solid #e8e4dc',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '14px'
        }}
      >
        <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, letterSpacing: '.06em', color: '#77786f', textTransform: 'uppercase' }}>
          ENTITLEMENT / BENEFIT
        </span>
        <strong style={{ fontSize: '14px', color: '#254c3c', fontFamily: 'Manrope, sans-serif' }}>
          {formattedBenefit}
        </strong>
      </div>

      {/* Brief Description */}
      <p>
        {scheme.brief_description || scheme.benefits_summary || 'Provides financial assistance, subsidies, or direct benefit transfer to eligible beneficiaries.'}
      </p>

      {/* Matched Details / Qualifying reasons */}
      {isMatchedView && scheme.qualifying_reasons && scheme.qualifying_reasons.length > 0 && (
        <div style={{ width: '100%', marginBottom: '16px', fontSize: '12px', color: '#45463f' }}>
          <strong style={{ display: 'block', color: '#254c3c', marginBottom: '4px' }}>Match Criteria:</strong>
          <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.5 }}>
            {scheme.qualifying_reasons.slice(0, 2).map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Card Action Links */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderTop: '1px solid #e8e4dc', paddingTop: '14px', marginTop: 'auto', gap: '8px' }}>
        <Link to={`/schemes/${scheme.scheme_id}`} className="arrow-link" style={{ fontWeight: 700, fontSize: '13px' }}>
          View details <span>→</span>
        </Link>

        {onOpenChecklist && (
          <button
            type="button"
            className="sample-button"
            style={{ fontSize: '12px', padding: '4px 10px' }}
            onClick={() => onOpenChecklist(scheme)}
          >
            📋 Documents
          </button>
        )}
      </div>
    </article>
  );
};

export default SchemeCard;
