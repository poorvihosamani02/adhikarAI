import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { aiApi } from '../api/aiApi';
import { schemesApi } from '../api/schemesApi';
import HealthBadge from '../components/common/HealthBadge';

const DocumentDoctorPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const initialSchemeId = query.get('scheme') || query.get('schemeId') || '';
  const initialDocName = query.get('docName') || '';

  const [rules, setRules] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  const [selectedSchemeId, setSelectedSchemeId] = useState(initialSchemeId);
  const [selectedRuleId, setSelectedRuleId] = useState('');
  const [file, setFile] = useState(null);
  const [userNotes, setUserNotes] = useState('Issued by Tahsildar / Revenue Authority');
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
          setSelectedRuleId(loadedRules[0].rule_id);
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

  const validateAndSetFile = (f) => {
    setFileError('');
    setAnalysisResult(null);
    if (!f) return;

    const validExts = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = f.name.split('.').pop().toLowerCase();

    if (!validExts.includes(ext)) {
      setFileError('Invalid file type. Only PDF, JPG, JPEG, and PNG are supported.');
      return;
    }

    if (f.size > 15 * 1024 * 1024) {
      setFileError('File exceeds 15 MB limit. Please select a smaller document file.');
      return;
    }

    setFile(f);
  };

  const handleRunCheck = async (e) => {
    e.preventDefault();
    if (!selectedRule) return;

    setChecking(true);
    setAnalysisResult(null);

    try {
      const res = await aiApi.checkDocument({
        scheme_id: selectedSchemeId || null,
        document_type: selectedRule.document_type,
        document_name: selectedRule.document_name,
        file_name: file ? file.name : 'income_certificate_2026.pdf',
        file_size_kb: file ? Math.round(file.size / 1024) : 240,
        user_notes: userNotes
      });

      setAnalysisResult(res);
    } catch (err) {
      console.error('Error pre-verifying document:', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <main>
      <div className="section-wrap" style={{ paddingTop: '50px', paddingBottom: '90px' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
          <div>
            <div className="section-kicker">DOCUMENT PRE-VERIFICATION</div>
            <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: '8px 0 10px', letterSpacing: '-.035em' }}>
              Understand and verify<br />
              <em>your application documents.</em>
            </h1>
            <p style={{ color: '#77786f', fontSize: '15px', maxWidth: '600px', margin: 0 }}>
              Avoid rejection at the official counter. Test your certificates and ID proofs against government rules before applying.
            </p>
          </div>

          <HealthBadge
            probeFn={() => aiApi.getDocumentHealth()}
            label="Doc Doctor Rule Engine"
          />
        </div>

        {/* Workspace: Split Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            alignItems: 'start'
          }}
        >
          {/* LEFT: Upload & Rule Selection Form */}
          <div
            style={{
              background: '#fffefa',
              border: '1px solid #e8e4dc',
              borderRadius: '24px',
              padding: '30px',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span className="process-step-number" style={{ margin: 0, width: '32px', height: '32px', fontSize: '13px' }}>01</span>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: '17px', fontWeight: 800 }}>
                  Select Document &amp; Upload
                </h3>
                <small style={{ color: '#77786f' }}>Choose target scheme and certificate</small>
              </div>
            </div>

            <form onSubmit={handleRunCheck}>
              {/* Target Scheme Dropdown */}
              <div style={{ marginBottom: '18px' }}>
                <label className="field">
                  <span>Target Government Scheme (Optional)</span>
                  <select
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                  >
                    <option value="">General Verification (All Schemes)</option>
                    {schemes.map((s) => (
                      <option key={s.scheme_id} value={s.scheme_id}>
                        {s.scheme_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Document Rule Dropdown */}
              <div style={{ marginBottom: '18px' }}>
                <label className="field">
                  <span>Certificate Type</span>
                  <select
                    value={selectedRuleId}
                    onChange={(e) => setSelectedRuleId(e.target.value)}
                    required
                  >
                    {rules.map((r) => (
                      <option key={r.rule_id} value={r.rule_id}>
                        {r.document_name} ({r.issuing_authority || r.document_type})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* File Upload Dropzone */}
              <div style={{ marginBottom: '18px' }}>
                <label className="field">
                  <span>Upload Document Copy (PDF, JPG, PNG)</span>
                  <div
                    style={{
                      border: '2px dashed #ded3fa',
                      borderRadius: '16px',
                      background: '#faf8f3',
                      padding: '28px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color .2s'
                    }}
                    onClick={() => document.getElementById('file-input-el')?.click()}
                  >
                    <input
                      id="file-input-el"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '30px', marginBottom: '8px' }}>📁</div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#254c3c' }}>
                      {file ? file.name : 'Click to browse or drop file here'}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#77786f' }}>
                      {file
                        ? `${(file.size / 1024).toFixed(1)} KB selected`
                        : 'Max file size 15 MB • PDF, JPG, PNG'}
                    </span>
                  </div>
                </label>

                {fileError && (
                  <div style={{ color: '#c93b2b', fontSize: '12px', marginTop: '6px' }}>
                    {fileError}
                  </div>
                )}
              </div>

              {/* Issuance Authority / User Context */}
              <div style={{ marginBottom: '22px' }}>
                <label className="field">
                  <span>Issuing Office / Remarks (Optional)</span>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. Issued by Tahsildar / Revenue Inspector"
                  />
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="button button-dark"
                disabled={checking}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {checking ? 'Checking against rules...' : 'Run Document Pre-Verification →'}
              </button>
            </form>
          </div>

          {/* RIGHT: Results / Official Rules Card */}
          <div
            style={{
              background: '#fffefa',
              border: '1px solid #e8e4dc',
              borderRadius: '24px',
              padding: '30px',
              boxShadow: 'var(--shadow-soft)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span className="process-step-number" style={{ margin: 0, width: '32px', height: '32px', fontSize: '13px' }}>02</span>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: '17px', fontWeight: 800 }}>
                  Verification Assessment
                </h3>
                <small style={{ color: '#77786f' }}>Rule checklist and official standards</small>
              </div>
            </div>

            {/* If analysis is not yet run: show rule specifications */}
            {!analysisResult && selectedRule && (
              <div>
                <div style={{ padding: '16px', borderRadius: '16px', background: '#faf8f3', border: '1px solid #e8e4dc', marginBottom: '20px' }}>
                  <span className="tiny-label" style={{ display: 'block', marginBottom: '4px' }}>SELECTED CERTIFICATE</span>
                  <strong style={{ fontSize: '16px', color: '#254c3c' }}>{selectedRule.document_name}</strong>
                  <p style={{ fontSize: '13px', color: '#66685f', margin: '6px 0 0' }}>
                    {selectedRule.description || 'Statutory certificate required for income, identity, or welfare category claims.'}
                  </p>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.06em', color: '#45463f', marginBottom: '10px' }}>
                  STANDARD VALIDITY RULES
                </div>
                <ul style={{ paddingLeft: '18px', margin: '0 0 20px', fontSize: '13px', lineHeight: 1.8, color: '#55564f' }}>
                  <li><strong>Issuing Authority:</strong> {selectedRule.issuing_authority || 'Designated Government Officer'}</li>
                  <li><strong>Validity Period:</strong> {selectedRule.validity_period || 'As per current financial year gazette'}</li>
                  <li><strong>Mandatory Fields:</strong> Official seal, digital signature/QR code, date of issue</li>
                </ul>

                <div style={{ padding: '14px', borderRadius: '12px', background: '#eeebff', fontSize: '12px', color: '#44317a' }}>
                  💡 Select your document file on the left and click "Run Document Pre-Verification" to test validity.
                </div>
              </div>
            )}

            {/* Analysis Result Banner */}
            {analysisResult && (
              <div>
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: analysisResult.is_valid || analysisResult.verdict === 'valid' ? '#e1f1e3' : '#fff0ef',
                    border: `1px solid ${analysisResult.is_valid || analysisResult.verdict === 'valid' ? '#c8e5cc' : '#f5c6c2'}`,
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {analysisResult.is_valid || analysisResult.verdict === 'valid' ? '✓' : '⚠️'}
                    </span>
                    <strong style={{ fontSize: '16px', color: analysisResult.is_valid || analysisResult.verdict === 'valid' ? '#254c3c' : '#c93b2b' }}>
                      {analysisResult.is_valid || analysisResult.verdict === 'valid'
                        ? 'Certificate Pre-Verified as Valid'
                        : 'Document Requires Attention'}
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#45463f' }}>
                    {analysisResult.verdict_summary || analysisResult.message || 'Verification completed against published department specifications.'}
                  </p>
                </div>

                {/* Rule-by-rule Checklist */}
                {analysisResult.rule_checklist && Array.isArray(analysisResult.rule_checklist) && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', color: '#45463f', marginBottom: '8px' }}>
                      SPECIFICATION CHECKS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analysisResult.rule_checklist.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: '#faf8f3',
                            border: '1px solid #e8e4dc',
                            fontSize: '13px'
                          }}
                        >
                          <span>{item.rule_name || item.name || item.check}</span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: item.passed ? '#254c3c' : '#c93b2b'
                            }}
                          >
                            {item.passed ? '✓ PASSED' : '✕ ATTENTION'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detected Issues */}
                {analysisResult.detected_issues && analysisResult.detected_issues.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.06em', color: '#c93b2b', marginBottom: '8px' }}>
                      DETECTED IRREGULARITIES
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#c93b2b', lineHeight: 1.6 }}>
                      {analysisResult.detected_issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Official Next Steps */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid #e8e4dc' }}>
                  <Link to="/documents" className="arrow-link" style={{ fontSize: '13px', fontWeight: 700 }}>
                    Open complete document checklist <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DocumentDoctorPage;
