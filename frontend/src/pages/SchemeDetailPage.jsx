import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDemoMode } from '../context/DemoModeContext';
import { getSchemeById, getSchemeDocuments } from '../api/schemesApi';
import DocumentChecklist from '../components/DocumentChecklist';
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  IndianRupee,
  ShieldCheck,
  FileText,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function SchemeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();

  const [scheme, setScheme] = useState(null);
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [schemeRes, docRes] = await Promise.all([
          getSchemeById(id, isDemoMode),
          getSchemeDocuments(id, isDemoMode)
        ]);

        setScheme(schemeRes.scheme);
        setDocData(docRes);
      } catch (err) {
        setError(err.message || 'Failed to load scheme details.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, isDemoMode]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-700)' }}>Loading Scheme Details...</h3>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Scheme Not Found</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
            {error || 'Unable to locate scheme record.'}
          </p>
          <Link to="/schemes" className="btn btn-secondary">
            <ArrowLeft size={16} /> Return to All Schemes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '960px' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/schemes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to All Schemes
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span className="badge badge-primary">{scheme.category}</span>
          <span className="badge badge-slate" style={{ textTransform: 'uppercase' }}>{scheme.jurisdiction}</span>
          <span className="badge badge-emerald">ID: {scheme.scheme_id}</span>
        </div>

        <h1 style={{ fontSize: '1.85rem', lineHeight: '1.3', color: 'var(--slate-900)', marginBottom: '0.75rem' }}>
          {scheme.scheme_name}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
          <Building2 size={16} color="#64748b" />
          <span>{scheme.provider_name || 'Government Ministry / Nodal Department'}</span>
        </div>

        {/* Benefits Overview Callout */}
        <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-100)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-900)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <IndianRupee size={16} color="#2563eb" /> Entitlement & Benefits
          </h4>
          <p style={{ fontSize: '0.92rem', color: 'var(--primary-800)', lineHeight: '1.5' }}>
            {scheme.benefit_description}
          </p>
        </div>

        {/* Key Criteria Grid */}
        <div className="grid-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
              Max Family Income
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
              {scheme.max_family_income ? `₹${scheme.max_family_income.toLocaleString('en-IN')} / year` : 'Not restricted in dataset'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
              Eligible Course / Degree
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
              {scheme.eligible_course || 'All Citizens / Not Restricted'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
              Eligible State / Territory
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
              {scheme.eligible_state || 'All India (National)'}
            </div>
          </div>
        </div>

        {/* Application Link */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {scheme.application_url ? (
            <a
              href={scheme.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              <span>Visit Official Application Portal</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>
              Official portal link not specified in dataset record.
            </span>
          )}

          {scheme.source_url && (
            <a
              href={scheme.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>Source Guideline</span>
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Narrative Eligibility Details */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <BookOpen size={18} color="#2563eb" /> Full Eligibility Criteria
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--slate-700)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {scheme.eligibility_text || 'No narrative eligibility text provided in this dataset record.'}
        </p>

        {scheme.notes && (
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--slate-200)', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            <strong>Research Dataset Note:</strong> {scheme.notes}
          </div>
        )}
      </div>

      {/* DOCUMENT CHECKLIST SECTION (Phase 3.F) */}
      <div style={{ marginBottom: '2rem' }}>
        <DocumentChecklist
          documents={docData?.documents || []}
          schemeId={scheme.scheme_id}
          schemeName={scheme.scheme_name}
          unavailableMessage={docData?.unavailable_message}
        />
      </div>
    </div>
  );
}
