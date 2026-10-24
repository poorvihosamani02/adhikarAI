import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { schemesApi } from '../api/schemesApi';

const SchemeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    schemesApi
      .getSchemeById(id)
      .then((res) => {
        setScheme(res?.data || res);
      })
      .catch((err) => {
        setError(err.message || 'Scheme details not found.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="section-wrap" style={{ textAlign: 'center', padding: '100px 20px', color: '#77786f' }}>
        <div style={{ fontSize: '28px', marginBottom: '14px' }}>⏳</div>
        <p>Loading scheme requirements and eligibility guidelines...</p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="section-wrap" style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚠️</div>
        <h2 style={{ fontFamily: 'Manrope, sans-serif' }}>Scheme Not Found</h2>
        <p style={{ color: '#77786f', marginBottom: '24px' }}>
          {error || 'The requested government scheme record could not be loaded.'}
        </p>
        <Link to="/schemes" className="button button-dark">
          Back to all schemes <span>→</span>
        </Link>
      </div>
    );
  }

  const isVerified = scheme.verification_status === 'verified';
  const benefitAmount = scheme.benefit_amount ? Number(scheme.benefit_amount) : null;
  const formattedBenefit = benefitAmount
    ? `₹${benefitAmount.toLocaleString('en-IN')}`
    : scheme.benefit_amount || 'Benefits as per official guidelines';

  const categoryTag = scheme.category || 'Welfare';
  const jurisdictionTag = scheme.jurisdiction === 'central' ? 'Central Government' : scheme.jurisdiction || 'State Scheme';

  return (
    <main>
      <div className="section-wrap" style={{ paddingTop: '50px', paddingBottom: '90px' }}>
        {/* Breadcrumb Navigation */}
        <div className="profile-breadcrumb" style={{ marginBottom: '24px' }}>
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/schemes">Explore Benefits</Link>
          <span>›</span>
          <strong>{scheme.scheme_name}</strong>
        </div>

        {/* Scheme Header Card */}
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '24px',
            padding: '36px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          {/* Tags Row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
            <span className="scheme-tag">{jurisdictionTag}</span>
            <span
              className="scheme-tag"
              style={{ background: '#eeebff', borderColor: '#ded3fa', color: '#44317a' }}
            >
              {categoryTag}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '999px',
                background: isVerified ? '#e1f1e3' : '#fff0e7',
                color: isVerified ? '#254c3c' : '#b07050'
              }}
            >
              {isVerified ? '✓ Official Verified Listing' : 'Review Underway'}
            </span>
          </div>

          <div className="section-kicker" style={{ marginBottom: '8px' }}>
            {scheme.provider_name || 'GOVERNMENT OF INDIA'}
          </div>

          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-.035em' }}>
            {scheme.scheme_name}
          </h1>

          <p style={{ color: '#66685f', fontSize: '16px', lineHeight: 1.7, margin: '0 0 24px', maxWidth: '800px' }}>
            {scheme.brief_description || scheme.description || scheme.benefits_summary}
          </p>

          {/* Entitlement Highlight Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
              background: '#faf8f3',
              border: '1px solid #e8e4dc',
              borderRadius: '16px',
              padding: '18px 24px',
              marginBottom: '28px'
            }}
          >
            <div>
              <span className="tiny-label" style={{ display: 'block', marginBottom: '4px' }}>
                DIRECT STATUTORY ENTITLEMENT / BENEFIT
              </span>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '22px', fontWeight: 800, color: '#254c3c' }}>
                {formattedBenefit}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {scheme.official_portal_url && (
                <a
                  href={scheme.official_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-dark"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  Visit Official Portal <span>↗</span>
                </a>
              )}

              <Link
                to={`/schemes/${scheme.scheme_id}/documents`}
                className="sample-button"
                style={{ padding: '9px 16px', fontSize: '13px', fontWeight: 700 }}
              >
                📋 Required Documents Checklist
              </Link>
            </div>
          </div>

          {/* Two-Column Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              borderTop: '1px solid #e8e4dc',
              paddingTop: '28px'
            }}
          >
            {/* Eligibility Requirements */}
            <div
              style={{
                background: '#faf8f3',
                border: '1px solid #e8e4dc',
                borderRadius: '18px',
                padding: '24px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', color: '#254c3c', marginBottom: '8px' }}>
                ELIGIBILITY CONDITIONS
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, margin: '0 0 14px' }}>
                Who Can Apply?
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#45463f', margin: '0 0 16px' }}>
                {scheme.eligibility_text || scheme.eligibility_summary || 'Citizens fulfilling household income and demographic norms specified in the gazette notification.'}
              </p>

              {scheme.eligibility_criteria && Array.isArray(scheme.eligibility_criteria) && (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: 1.7, color: '#55564f' }}>
                  {scheme.eligibility_criteria.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Application Steps & Verification */}
            <div
              style={{
                background: '#faf8f3',
                border: '1px solid #e8e4dc',
                borderRadius: '18px',
                padding: '24px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', color: '#57428f', marginBottom: '8px' }}>
                APPLICATION PROCEDURE
              </div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, margin: '0 0 14px' }}>
                How to Submit Your Application
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#45463f', margin: '0 0 16px' }}>
                {scheme.application_process || 'Submit online via the national / state portal, or through designated CSC / Seva Sindhu facilitation centers.'}
              </p>

              <div style={{ paddingTop: '14px', borderTop: '1px solid #e8e4dc' }}>
                <span className="tiny-label" style={{ display: 'block', marginBottom: '6px' }}>
                  PRE-VERIFICATION RECOMMENDATION
                </span>
                <p style={{ fontSize: '12px', color: '#77786f', margin: '0 0 12px' }}>
                  Avoid rejection at the verification counter by checking your certificates against official rules before submitting.
                </p>
                <Link
                  to={`/document-doctor?scheme=${encodeURIComponent(scheme.scheme_id)}`}
                  className="arrow-link"
                  style={{ fontWeight: 700, fontSize: '13px' }}
                >
                  Pre-verify with Document Doctor <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/schemes" className="text-link">
            ← Back to all schemes
          </Link>
          <Link to="/my-schemes" className="arrow-link">
            Check your personal eligibility in My Schemes <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default SchemeDetailPage;
