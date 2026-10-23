import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { checkDocument, checkDocumentHealth, getDocumentRules } from '../services/documentDoctorService';
import schemesData from '../data/schemes.json';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  ListChecks,
  AlertCircle
} from 'lucide-react';

export default function DocumentDoctorPage() {
  const [searchParams] = useSearchParams();
  const initialSchemeId = searchParams.get('schemeId') || '';
  const initialDocName = searchParams.get('docName') || '';

  const rules = getDocumentRules();

  const [selectedSchemeId, setSelectedSchemeId] = useState(initialSchemeId);
  const [selectedDocRuleId, setSelectedDocRuleId] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [userNotes, setUserNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking' | 'healthy' | 'unhealthy'
  const [healthDetail, setHealthDetail] = useState('');

  // Probe live service health on mount
  useEffect(() => {
    let isMounted = true;

    async function verifyHealth() {
      try {
        const res = await checkDocumentHealth();
        if (isMounted) {
          if (res.isHealthy) {
            setHealthStatus('healthy');
            setHealthDetail('Connected to Document Doctor AI microservice (Port 3000 → Port 8002)');
          } else {
            setHealthStatus('unhealthy');
            setHealthDetail(res.message || 'Document Doctor service is currently unreachable.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setHealthStatus('unhealthy');
          setHealthDetail(err.message || 'Cannot contact backend.');
        }
      }
    }

    verifyHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize selected document rule if docName matches
  useEffect(() => {
    if (initialDocName && rules.length > 0) {
      const match = rules.find((r) =>
        r.document_name.toLowerCase().includes(initialDocName.toLowerCase()) ||
        initialDocName.toLowerCase().includes(r.document_name.toLowerCase())
      );
      if (match) {
        setSelectedDocRuleId(match.rule_id);
      } else {
        setSelectedDocRuleId(rules[0].rule_id);
      }
    } else if (rules.length > 0 && !selectedDocRuleId) {
      setSelectedDocRuleId(rules[0].rule_id);
    }
  }, [initialDocName, rules]);

  const activeRule = rules.find((r) => r.rule_id === selectedDocRuleId) || rules[0];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file extension
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
        setError(`Unsupported file type '.${ext}'. Only PDF and images (JPG, PNG) are permitted.`);
        setUploadedFile(null);
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Sample file exceeds 5MB limit. Please upload a compressed PDF or image.');
        setUploadedFile(null);
        return;
      }

      if (file.size === 0) {
        setError('The selected file is empty (0 bytes). Please upload a valid document.');
        setUploadedFile(null);
        return;
      }

      setUploadedFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!activeRule) {
      setError('Please select a document type.');
      return;
    }

    if (loading) return; // Prevent duplicate submissions

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    const payload = {
      scheme_id: selectedSchemeId || null,
      document_type: activeRule.document_type,
      document_name: activeRule.document_name,
      file_name: uploadedFile ? uploadedFile.name : 'sample_document.pdf',
      file_size_kb: uploadedFile ? Math.max(1, Math.round(uploadedFile.size / 1024)) : 150,
      user_notes: userNotes
    };

    try {
      const res = await checkDocument(payload);
      setAnalysisResult(res);
    } catch (err) {
      setError(err.message || 'Error occurred while contacting Document Doctor API route.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '960px' }}>
      {/* Title & Connection Status */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <FileText size={28} color="#059669" />
            <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
              Document Doctor
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>
            Pre-verify your scheme application certificates against 30 official Indian documentation criteria.
          </p>
        </div>

        {/* Live Service Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            background: healthStatus === 'healthy' ? '#ecfdf5' : healthStatus === 'unhealthy' ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${healthStatus === 'healthy' ? '#a7f3d0' : healthStatus === 'unhealthy' ? '#fecaca' : '#e2e8f0'}`,
            color: healthStatus === 'healthy' ? '#047857' : healthStatus === 'unhealthy' ? '#b91c1c' : '#64748b'
          }}
          title={healthDetail}
        >
          {healthStatus === 'healthy' ? (
            <>
              <CheckCircle2 size={13} color="#059669" />
              <span>AI Service Connected</span>
            </>
          ) : healthStatus === 'unhealthy' ? (
            <>
              <XCircle size={13} color="#dc2626" />
              <span>Service Offline</span>
            </>
          ) : (
            <>
              <RefreshCw size={13} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span>Checking AI service...</span>
            </>
          )}
        </div>
      </div>

      {/* Practice Notice */}
      <div className="alert alert-info" style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
        <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong>Educational Pre-Verification:</strong> Extraction and authenticity rules are grounded in official dataset criteria (<code>document_doctor_dataset.csv</code>). This service performs statutory pre-checks and does <strong>NOT</strong> replace official government portal verification.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Document Doctor Error:</strong> {error}
            <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
              Verify Node.js backend (port 3000) and Document Doctor microservice (port 8002) are running.
            </div>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAnalyze}>
          <div className="grid-2">
            {/* Associated Scheme */}
            <div className="form-group">
              <label className="form-label" htmlFor="schemeSelect">
                Select Scheme (Optional)
              </label>
              <select
                id="schemeSelect"
                className="form-control"
                value={selectedSchemeId}
                onChange={(e) => setSelectedSchemeId(e.target.value)}
                disabled={loading}
              >
                <option value="">General Citizen Document (No specific scheme)</option>
                {schemesData.map((s) => (
                  <option key={s.scheme_id} value={s.scheme_id}>
                    {s.scheme_id}: {s.scheme_name.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Document Type from 30 rules */}
            <div className="form-group">
              <label className="form-label" htmlFor="docRuleSelect">
                Document Type to Verify (30 Official Rules)
              </label>
              <select
                id="docRuleSelect"
                className="form-control"
                value={selectedDocRuleId}
                onChange={(e) => setSelectedDocRuleId(e.target.value)}
                disabled={loading}
              >
                {rules.map((r) => (
                  <option key={r.rule_id} value={r.rule_id}>
                    [{r.document_type}] {r.document_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Rule Metadata Summary */}
          {activeRule && (
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ color: 'var(--slate-600)' }}>Issuing Authority: <strong>{activeRule.issuing_authority}</strong></span>
                <span style={{ color: 'var(--slate-600)' }}>Format: <strong>{activeRule.accepted_format}</strong></span>
              </div>
              <div style={{ color: 'var(--slate-700)' }}>
                <strong>Statutory Purpose:</strong> {activeRule.document_purpose}
              </div>
            </div>
          )}

          {/* Sample Upload Box */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="fileUpload">
              Upload Sample Certificate (PDF or Clear Image)
            </label>
            <div
              style={{
                border: '2px dashed var(--slate-300)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                backgroundColor: uploadedFile ? 'var(--emerald-50)' : 'var(--slate-50)',
                borderColor: uploadedFile ? 'var(--emerald-500)' : 'var(--slate-300)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onClick={() => {
                if (!loading) document.getElementById('fileUpload').click();
              }}
            >
              <UploadCloud size={32} color={uploadedFile ? '#059669' : '#94a3b8'} style={{ margin: '0 auto 0.5rem' }} />
              {uploadedFile ? (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--emerald-800)', fontSize: '0.92rem' }}>
                    {uploadedFile.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--emerald-700)' }}>
                    {(uploadedFile.size / 1024).toFixed(1)} KB &bull; Selected for rule-based analysis
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--slate-700)', fontWeight: 600 }}>
                    Click to select a sample certificate file
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
                    Supported: PDF, JPG, PNG (Max 5MB). File metadata stays secure.
                  </div>
                </div>
              )}
              <input
                id="fileUpload"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* User Notes (Optional) */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="userNotes">
              Citizen Notes / Application Specifics (Optional)
            </label>
            <input
              id="userNotes"
              type="text"
              className="form-control"
              placeholder="e.g. Verifying for post-matric scholarship application or income limit check"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              disabled={loading}
              style={{ padding: '0.65rem 0.9rem', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Inspecting Document via AI Service...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run Document Doctor Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Analysis Results */}
      {analysisResult && (
        <div className="card animate-fade-in" style={{ borderTop: '4px solid var(--emerald-500)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> Inspection Complete ({analysisResult.rule_id})
              </span>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>
                Analysis for {analysisResult.document_name}
              </h2>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
              Issuing Authority: <strong style={{ color: 'var(--slate-700)' }}>{analysisResult.issuing_authority}</strong>
            </div>
          </div>

          {/* Transparent Disclaimer */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <ShieldAlert size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{analysisResult.disclaimer}</span>
          </div>

          {/* SECTION 1: Extracted Information */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={18} color="#059669" /> 1. Extracted Information & Required Fields
            </h3>
            <div style={{ background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', overflow: 'hidden' }}>
              {Object.entries(analysisResult.extracted_fields || {}).map(([key, val], idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    borderBottom: idx < Object.keys(analysisResult.extracted_fields).length - 1 ? '1px solid var(--slate-200)' : 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{key}</span>
                  <span style={{ color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} color="#059669" /> {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Official Validation Checks */}
          {analysisResult.validation_checks && analysisResult.validation_checks.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ListChecks size={18} color="#2563eb" /> 2. Official Statutory Validation Checks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {analysisResult.validation_checks.map((vc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                    <CheckCircle size={14} color="#059669" style={{ flexShrink: 0 }} />
                    <span style={{ color: 'var(--slate-700)' }}>{vc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: Common Pitfalls & Errors to Avoid */}
          {analysisResult.common_errors_to_check && analysisResult.common_errors_to_check.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={18} color="#eab308" /> 3. Common Citizen Pitfalls & Errors to Check
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {analysisResult.common_errors_to_check.map((errItem, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fffbeb', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #fef3c7', fontSize: '0.84rem' }}>
                    <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#92400e' }}>{errItem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: Cross-Check & Possible Mismatches */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={18} color="#64748b" /> 4. Cross-Document Verification Checklist
            </h3>
            {analysisResult.possible_mismatches && analysisResult.possible_mismatches.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysisResult.possible_mismatches.map((m, i) => (
                  <div key={i} style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '0.85rem' }}>
                    {m}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', background: 'var(--slate-50)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)' }}>
                No cross-document discrepancies detected based on entered metadata.
              </div>
            )}
          </div>

          {/* SECTION 5: Corrective Next Steps */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={18} color="#059669" /> 5. Corrective Action & Verification Method
            </h3>
            <div style={{ background: 'var(--emerald-50)', border: '1px solid var(--emerald-200)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--emerald-900)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                Official Verification Method:
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--emerald-800)', marginBottom: '0.65rem' }}>
                {analysisResult.official_verification_method || 'Official government portal verification'}
              </p>
              <div style={{ fontWeight: 600, color: 'var(--emerald-900)', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                Recommended Action:
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--emerald-800)' }}>
                {analysisResult.corrective_action || 'Ensure this copy is clearly legible before submitting to government portal.'}
              </p>
            </div>

            {analysisResult.source_url && (
              <a
                href={analysisResult.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Verify on Official Issuing Portal ({analysisResult.issuing_authority})</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

