import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileCheck2,
  FileText,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Shield,
  Printer,
  Sparkles,
  Search
} from 'lucide-react';
import { mockSchemesService } from '../data/mockService';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';

const DocumentChecklistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(id || 'GOV001');
  const [schemeData, setSchemeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockSchemesService
      .getAllSchemes()
      .then((res) => {
        setSchemes(res.data);
        if (id) {
          setSelectedSchemeId(id);
        } else if (res.data.length > 0) {
          setSelectedSchemeId(res.data[0].scheme_id);
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (selectedSchemeId) {
      setLoading(true);
      mockSchemesService
        .getSchemeDocuments(selectedSchemeId)
        .then((res) => {
          setSchemeData(res);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [selectedSchemeId]);

  return (
    <div className="container" style={{ maxWidth: '980px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
          <Link to="/" style={{ color: 'inherit' }}>Home</Link>
          <ChevronRight size={14} />
          <Link to="/schemes" style={{ color: 'inherit' }}>Schemes</Link>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--slate-800)', fontWeight: 600 }}>Document Checklist</span>
        </nav>

        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/schemes')}>
          Back to Schemes
        </Button>
      </div>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Badge variant="blue" icon={FileCheck2}>
            Pre-Application Requirements
          </Badge>
          <Badge variant="emerald">Standardized Guidance</Badge>
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Required Document Checklists
        </h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem' }}>
          Review official certificates and identity documents required before applying for government welfare schemes.
        </p>
      </div>

      {/* Scheme Selector */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--slate-700)', flexShrink: 0 }}>
          Select Scheme:
        </label>
        <select
          className="form-select"
          style={{ flex: 1, minWidth: '260px' }}
          value={selectedSchemeId}
          onChange={(e) => setSelectedSchemeId(e.target.value)}
        >
          {schemes.map((s) => (
            <option key={s.scheme_id} value={s.scheme_id}>
              {s.scheme_id}: {s.scheme_name} ({s.jurisdiction})
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
          Print Checklist
        </Button>
      </div>

      {/* Checklist Content */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          Loading document requirements...
        </div>
      ) : schemeData ? (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Badge variant={schemeData.jurisdiction === 'central' ? 'blue' : 'purple'}>
                  {schemeData.jurisdiction === 'central' ? 'Central Scheme' : 'Karnataka State'}
                </Badge>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {schemeData.scheme_name}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                Provider Ministry: <strong>{schemeData.provider_name}</strong>
              </div>
            </div>

            {schemeData.official_portal_url && (
              <a
                href={schemeData.official_portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Official Portal</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          <Alert variant="info">
            <strong>Verification Recommendation:</strong> Prior to submitting on the official portal, use Document Doctor to
            pre-check that certificates carry current academic year validity and authorized digital tahsildar seals.
          </Alert>

          {/* Documents Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {schemeData.documents && schemeData.documents.length > 0 ? (
              schemeData.documents.map((doc, idx) => (
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
                        <Badge variant="blue" style={{ fontSize: '0.7rem' }}>
                          {doc.category}
                        </Badge>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: '0.25rem 0' }}>
                        {doc.guidance}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        Issuing Authority: <strong>{doc.issuing_authority}</strong> &bull; Verification:{' '}
                        <em>{doc.verification_method}</em>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={FileCheck2}
                    onClick={() =>
                      navigate(
                        `/document-doctor?schemeId=${schemeData.scheme_id}&docName=${encodeURIComponent(doc.name)}`
                      )
                    }
                  >
                    Check with Document Doctor
                  </Button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                Standard identity verification (Aadhaar / Voter ID) and bank passbook apply.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DocumentChecklistPage;
