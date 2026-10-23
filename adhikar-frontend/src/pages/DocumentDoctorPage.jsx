import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileCheck2,
  UploadCloud,
  X,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { aiApi } from '../api/aiApi';
import { schemesApi } from '../api/schemesApi';
import Badge from '../components/ui/Badge';
import HealthBadge from '../components/common/HealthBadge';

const DocumentDoctorPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialSchemeId = query.get('schemeId') || '';
  const initialDocName = query.get('docName') || '';

  const [rules, setRules] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  const [selectedSchemeId, setSelectedSchemeId] = useState(initialSchemeId);
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [file, setFile] = useState(null);
  const [userNotes, setUserNotes] = useState('Issued by Tahsildar Bangalore North');
  const [fileError, setFileError] = useState('');

  const [checking, setChecking] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    Promise.all([
      aiApi.getDocumentRules(),
      schemesApi.getAllSchemes()
    ])
      .then(([rulesRes, schemesRes]) => {
        const loadedRules = rulesRes?.rules || [];
        const loadedSchemes = schemesRes?.data || schemesRes?.schemes || [];
        setRules(loadedRules);
        setSchemes(loadedSchemes);

        if (initialDocName) {
          const match = loadedRules.find(
            (r) =>
              r.document_name.toLowerCase().includes(initialDocName.toLowerCase()) ||
              initialDocName.toLowerCase().includes(r.document_name.toLowerCase())
          );
          if (match) setSelectedRuleId(match.rule_id);
          else if (loadedRules.length > 0) setSelectedRuleId(loadedRules[0].rule_id);
        } else if (loadedRules.length > 0) {
          setSelectedRuleId(loadedRules[1]?.rule_id || loadedRules[0].rule_id);
        }
      })
      .catch((err) => console.error('Failed to load rules/schemes in Document Doctor:', err))
      .finally(() => setLoadingRules(false));
  }, [initialDocName]);

  const selectedRule = rules.find((r) => r.rule_id === selectedRuleId);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    validateAndSetFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    validateAndSetFile(dropped);
  };

  const validateAndSetFile = (f) => {
    setFileError('');
    if (!f) return;

    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = f.name.split('.').pop().toLowerCase();

    if (!validExts.includes(ext)) {
      setFileError('Invalid file type. Only .PDF, .JPG, .JPEG, and .PNG formats are accepted.');
      return;
    }

    if (f.size > 5 * 1024 * 1024) {
      setFileError('File exceeds 5 MB limit. Please compress your document before uploading.');
      return;
    }

    setFile(f);
  };

  const handleRunCheck = async (e) => {
    e.preventDefault();
    if (!selectedRule) return;

    setChecking(true);
    try {
      const fileSizeKb = file ? Math.round(file.size / 1024) : 240;
      const fileName = file ? file.name : `${selectedRule.document_name.toLowerCase().replace(/\s+/g, '_')}_2026.pdf`;

      const result = await aiApi.checkDocument({
        scheme_id: selectedSchemeId,
        document_type: selectedRule.document_type,
        document_name: selectedRule.document_name,
        file_name: fileName,
        file_size_kb: fileSizeKb,
        user_notes: userNotes
      });

      setAnalysisResult(result);
    } catch (err) {
      console.error('Failed to pre-verify document:', err);
      alert(err.message || 'Error occurred while verifying document with Document Doctor.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1040px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header */}
      <div>
        <span className="eyebrow-text">CERTIFICATE VALIDATION</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em' }}>
          Document Doctor Pre-Check.
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.4rem' }}>
          Avoid rejection by validating income certificates, caste declarations, and identity proof against official
          statutory guidelines before applying.
        </p>
      </div>

      <div className="grid-2">
        {/* Left Column: Two-Step Form (Clean White Card) */}
        <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)' }}>
          <form onSubmit={handleRunCheck}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--charcoal-100)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--coral-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 01
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
                  Select Certificate Type
                </h3>
              </div>

              {/* Target Scheme Dropdown */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Welfare Scheme (Optional)</label>
                <select
                  className="form-select"
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                >
                  <option value="">General Verification (Not Scheme Specific)</option>
                  {schemes.map((s) => (
                    <option key={s.scheme_id} value={s.scheme_id}>
                      {s.scheme_id}: {s.scheme_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Rule Dropdown */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label form-label-required">Document to Verify</label>
                <select
                  className="form-select"
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  disabled={loadingRules}
                >
                  {rules.map((r) => (
                    <option key={r.rule_id} value={r.rule_id}>
                      {r.document_name} ({r.document_type})
                    </option>
                  ))}
                </select>
                {selectedRule && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--charcoal-500)', marginTop: '0.35rem' }}>
                    Issuing: <strong>{selectedRule.issuing_authority}</strong>
                  </div>
                )}
              </div>

              <div style={{ borderBottom: '1px solid var(--charcoal-100)', paddingBottom: '0.75rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--coral-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 02
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
                  Upload File / Metadata
                </h3>
              </div>

              {/* Drag & Drop Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed var(--charcoal-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: 'var(--charcoal-50)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onClick={() => document.getElementById('doc-file-input')?.click()}
              >
                <input
                  id="doc-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <UploadCloud size={40} style={{ color: 'var(--coral-600)', margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--charcoal-900)' }}>
                  {file ? file.name : 'Click to select or drag and drop file'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--charcoal-500)', marginTop: '0.25rem' }}>
                  Supports PDF, JPG, PNG up to 5 MB
                </div>
              </div>

              {fileError && <div style={{ color: 'var(--danger-600)', fontSize: '0.8rem', fontWeight: 600 }}>{fileError}</div>}

              {file && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.95rem',
                    background: 'var(--coral-50)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--coral-800)' }}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--charcoal-500)' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Citizen Notes */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Citizen Notes / Issuance Details</label>
                <input
                  type="text"
                  className="form-input"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. Issued last month by Tahsildar Bangalore North"
                />
              </div>

              <button
                type="submit"
                disabled={checking}
                className="btn btn-block"
                style={{
                  background: 'var(--coral-600)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  padding: '0.9rem'
                }}
              >
                <span>{checking ? 'Analyzing Heuristics...' : 'Run Pre-Verification Check'}</span>
                {!checking && <ArrowUpRight size={17} />}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Pre-Verification Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {analysisResult ? (
            <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge badge-emerald">
                  <ShieldCheck size={14} /> Pre-Check Passed
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--charcoal-500)', fontWeight: 600 }}>
                  Rule: {analysisResult.rule_id}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
                  {analysisResult.document_name}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--charcoal-600)', marginTop: '0.2rem' }}>
                  {analysisResult.document_purpose}
                </div>
              </div>

              {/* Validity & Expiry Rule */}
              <div style={{ background: 'var(--charcoal-50)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--charcoal-100)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--charcoal-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Statutory Validity Rule
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--charcoal-900)', fontWeight: 700, marginTop: '0.2rem' }}>
                  {analysisResult.expiry_or_validity_rule}
                </div>
              </div>

              {/* Validation Checklist */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--emerald-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Acceptance Criteria to Confirm:
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  {analysisResult.validation_checks.map((check, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--charcoal-800)' }}>
                      <CheckCircle2 size={15} style={{ color: 'var(--emerald-600)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Errors & Rejection Warnings */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--danger-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} /> Known Reasons for Rejection:
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  {analysisResult.common_errors_to_check.map((err, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--charcoal-700)' }}>
                      <AlertTriangle size={15} style={{ color: 'var(--coral-600)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Official Verification Link */}
              {analysisResult.source_url && (
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--charcoal-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--charcoal-500)' }}>
                    Verify official barcode / seal:
                  </span>
                  <a
                    href={analysisResult.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--charcoal-100)',
                      color: 'var(--charcoal-900)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>State Revenue Portal</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-400)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                {analysisResult.disclaimer}
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '3.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                minHeight: '360px',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--coral-50)',
                  color: 'var(--coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileCheck2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
                Pre-Verification Report Ready
              </h3>
              <p style={{ color: 'var(--charcoal-600)', fontSize: '0.9rem', maxWidth: '340px', lineHeight: 1.6 }}>
                Select a document from the 30 loaded rules on the left and click <strong>"Run Pre-Verification Check"</strong> to inspect
                validity criteria, required issuing seals, and known rejection errors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDoctorPage;
