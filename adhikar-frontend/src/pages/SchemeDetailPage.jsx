import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  IndianRupee,
  FileCheck2,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  Compass,
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import { mockSchemesService } from '../data/mockService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

const SchemeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    mockSchemesService
      .getSchemeById(id)
      .then((res) => {
        setScheme(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Scheme not found.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--slate-500)' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Scheme Information...</div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="container" style={{ maxWidth: '640px', marginTop: '2rem' }}>
        <Alert variant="danger" title="Scheme Not Found">
          {error || 'The requested government scheme record could not be loaded.'}
        </Alert>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/schemes')}>
          Back to Government Schemes
        </Button>
      </div>
    );
  }

  const isVerified = scheme.verification_status === 'verified';
  const benefitAmount = scheme.benefit_amount ? Number(scheme.benefit_amount) : null;

  return (
    <div className="container" style={{ maxWidth: '1080px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Breadcrumbs & Top Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
          <Link to="/" style={{ color: 'inherit' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/schemes" style={{ color: 'inherit' }}>Schemes</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--slate-800)', fontWeight: 600 }}>{scheme.scheme_id}</span>
        </nav>

        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/schemes')}>
          Back to All Schemes
        </Button>
      </div>

      {/* 2. Scheme Hero Card */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: '28px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge variant={scheme.jurisdiction === 'central' ? 'blue' : 'purple'}>
            {scheme.jurisdiction === 'central' ? 'Central Government Scheme' : 'Karnataka State Scheme'}
          </Badge>
          <Badge variant="slate">{scheme.category || 'Welfare'}</Badge>
          <Badge
            variant={isVerified ? 'emerald' : 'amber'}
            icon={isVerified ? ShieldCheck : AlertTriangle}
          >
            {isVerified ? 'Gazette Verified' : 'Needs Review'}
          </Badge>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
            ID: {scheme.scheme_id}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 850, color: 'var(--slate-900)', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
          {scheme.scheme_name}
        </h1>

        <div style={{ fontSize: '0.95rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Administered by: <strong>{scheme.provider_name}</strong></span>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {scheme.application_url && (
            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Apply on Official Portal</span>
              <ArrowUpRight size={18} />
            </a>
          )}
          <Button
            variant="outline"
            size="lg"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Checklist
          </Button>
        </div>
      </div>

      {/* 3. Verification Warning Alert (if needs_review) */}
      {!isVerified && (
        <Alert variant="warning" title="Open Data Gazette Notice">
          This scheme record is cataloged from open data and is awaiting official ministry gazette re-verification.
          Always verify application window dates and deadline announcements on the designated department website.
        </Alert>
      )}

      {/* 4. Key Parameters Grid */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
          Key Scheme Parameters &amp; Eligibility Ceilings
        </h2>
        <div className="grid-3">
          {/* Benefit Amount */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Entitlement Value
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-600)', margin: '0.25rem 0' }}>
              {benefitAmount ? `₹${benefitAmount.toLocaleString('en-IN')}` : scheme.benefit_amount || 'Non-Monetary'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
              Frequency: {scheme.benefit_frequency || 'Annual / Per Academic Year'}
            </div>
          </div>

          {/* Max Family Income */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Maximum Family Income
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.25rem 0' }}>
              {scheme.max_family_income
                ? `₹${Number(scheme.max_family_income).toLocaleString('en-IN')}`
                : 'No Ceiling'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
              Gross parental / household income per annum
            </div>
          </div>

          {/* Eligible Age Range */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Age Eligibility
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.25rem 0' }}>
              {scheme.min_age && scheme.max_age
                ? `${scheme.min_age} - ${scheme.max_age} Yrs`
                : scheme.max_age
                ? `Up to ${scheme.max_age} Yrs`
                : 'All Ages'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
              Applicable citizen age bracket
            </div>
          </div>
        </div>
      </div>

      {/* 5. Detailed Eligibility Narrative */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
          Statutory Eligibility Guidelines
        </h3>
        <p style={{ color: 'var(--slate-700)', fontSize: '0.95rem', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
          {scheme.eligibility_text || 'Refer to the official ministry guidelines for comprehensive conditions.'}
        </p>

        {scheme.eligible_course && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)' }}>
              Eligible Course / Academic Stream:{' '}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              {scheme.eligible_course}
            </span>
          </div>
        )}
      </div>

      {/* 6. Required Documents & Document Doctor Pre-Check */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              Official Required Documents Checklist
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
              Certificates required for submission. Click to pre-verify format and expiration with Document Doctor.
            </p>
          </div>
          <Badge variant="blue">{scheme.structured_documents?.length || 0} Required</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {scheme.structured_documents && scheme.structured_documents.length > 0 ? (
            scheme.structured_documents.map((doc, idx) => (
              <div
                key={doc.id || idx}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--slate-50)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
                        {doc.name}
                      </span>
                      <Badge variant="slate" style={{ fontSize: '0.7rem' }}>
                        {doc.category}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: '0.25rem 0' }}>
                      {doc.guidance}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      Issuing Authority: <strong>{doc.issuing_authority}</strong>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={FileCheck2}
                  onClick={() =>
                    navigate(
                      `/document-doctor?schemeId=${scheme.scheme_id}&docName=${encodeURIComponent(doc.name)}`
                    )
                  }
                >
                  Verify with Document Doctor
                </Button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
              Standard identity and income documentation applies.
            </div>
          )}
        </div>
      </div>

      {/* 7. Official Source & Gazette Verification Links */}
      <div
        style={{
          background: 'var(--slate-50)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
          <div>Source Portal: <a href={scheme.source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{scheme.source_url || 'Official Ministry Portal'}</a></div>
          {scheme.notes && <div style={{ marginTop: '0.25rem', fontStyle: 'italic', fontSize: '0.8rem' }}>Note: {scheme.notes}</div>}
        </div>

        <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/schemes')}>
          Return to Scheme Catalog
        </Button>
      </div>
    </div>
  );
};

export default SchemeDetailPage;
