import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../context/DemoModeContext';
import { analyzeScamMessage, getSampleScamMessages, checkScamHealth } from '../api/scamApi';
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Send,
  Sparkles,
  RefreshCw,
  ExternalLink,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  Info
} from 'lucide-react';

export default function ScamShieldPage() {
  const { isDemoMode } = useDemoMode();
  const sampleMessages = getSampleScamMessages();

  const [messageText, setMessageText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking' | 'healthy' | 'unhealthy'
  const [healthDetail, setHealthDetail] = useState('');

  // Probe live service health on mount
  useEffect(() => {
    let isMounted = true;
    async function verifyHealth() {
      try {
        const res = await checkScamHealth();
        if (isMounted) {
          if (res.isHealthy) {
            setHealthStatus('healthy');
            setHealthDetail('Connected to Scam Shield AI microservice (Port 3000 → Port 8003)');
          } else {
            setHealthStatus('unhealthy');
            setHealthDetail(res.message || 'Scam Shield service is currently unreachable.');
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
    return () => { isMounted = false; };
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) {
      setError('Please paste or type the suspicious message text.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeScamMessage(
        {
          message_text: messageText,
          url: url.trim() || undefined
        },
        isDemoMode
      );
      setResult(res);
    } catch (err) {
      setError(err.message || 'Failed to analyze message via backend route.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setMessageText(sample.message_text);
    const extractedUrl = sample.message_text.match(/https?:\/\/[^\s]+/);
    setUrl(extractedUrl ? extractedUrl[0] : (sample.evidence_url || ''));
    setError(null);
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'high':
        return <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>HIGH RISK SCAM</span>;
      case 'medium':
        return <span className="badge badge-saffron" style={{ fontSize: '0.85rem' }}>SUSPICIOUS / UNVERIFIED</span>;
      case 'safe':
        return <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>OFFICIAL / LOW RISK</span>;
      default:
        return <span className="badge badge-slate" style={{ fontSize: '0.85rem' }}>GENERAL / LOW RISK</span>;
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <ShieldAlert size={28} color="#ea580c" />
          <h1 style={{ fontSize: '1.8rem', color: 'var(--slate-900)' }}>
            Scam Shield & Citizen Threat Defense
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
          Inspect suspicious SMS, WhatsApp offers, or fake scholarship links against verified cybercrime patterns.
        </p>
        {!isDemoMode && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', background: healthStatus === 'healthy' ? '#ecfdf5' : '#fef2f2', color: healthStatus === 'healthy' ? '#065f46' : '#991b1b', border: `1px solid ${healthStatus === 'healthy' ? '#a7f3d0' : '#fecaca'}` }}>
            {healthStatus === 'healthy' ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
            <span>{healthStatus === 'healthy' ? 'Live AI Microservice Connected (Port 3000 → Port 8003)' : healthDetail || 'Live AI Service Offline (Start Port 8003)'}</span>
          </div>
        )}
      </div>

      {/* Demo Notice */}
      <div className="alert alert-info" style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
        <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong>Heuristic Advisory Model:</strong> Evaluation uses pattern detection and 22 verified Indian advisory records. Does not represent a trained deep neural network; no message is guaranteed 100% safe or fraudulent.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
          <AlertTriangle size={18} />
          <div>
            <strong>Error:</strong> {error}
            <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
              Target endpoint: <code>POST /api/scam/analyze</code> (Node.js &rarr; Python Port 8003)
            </div>
          </div>
        </div>
      )}

      {/* Quick Test Samples from Dataset */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
          Test with Real Dataset Examples (1-Click Fill):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {sampleMessages.slice(0, 5).map((s) => (
            <button
              key={s.example_id}
              type="button"
              onClick={() => loadSample(s)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              {s.scam_type} ({s.channel})
            </button>
          ))}
          {/* Include 1 genuine sample for balance */}
          {sampleMessages.find((s) => s.label === 'genuine') && (
            <button
              type="button"
              onClick={() => loadSample(sampleMessages.find((s) => s.label === 'genuine'))}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderColor: 'var(--emerald-300)', color: 'var(--emerald-800)' }}
            >
              Verified Govt SMS (NMMS)
            </button>
          )}
        </div>
      </div>

      {/* Input Box */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAnalyze}>
          <div className="form-group">
            <label className="form-label" htmlFor="messageInput">
              Paste Suspicious Message Text
            </label>
            <textarea
              id="messageInput"
              className="form-control"
              rows={4}
              placeholder="e.g. Dear Customer, your electricity connection will be disconnected tonight at 9:30 PM..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="urlInput">
              Associated Link or URL (Optional)
            </label>
            <input
              id="urlInput"
              type="text"
              className="form-control"
              placeholder="e.g. http://power-update-pay.xyz"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <span className="form-hint">Links are inspected for suspicious domains and compared against official .gov.in domains.</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Scanning Message Heuristics...</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={16} />
                  <span>Analyze Suspicious Message</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Box (Phase 3.H) */}
      {result && (
        <div className="card animate-fade-in" style={{ borderTop: `4px solid ${result.risk_level === 'high' ? 'var(--danger-500)' : result.risk_level === 'medium' ? 'var(--saffron-500)' : 'var(--emerald-500)'}` }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                {getRiskBadge(result.risk_level)}
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                  Confidence Score: {Math.round(result.confidence_score * 100)}%
                </span>
                {result.is_mock || result.is_demo ? (
                  <span className="badge badge-slate" style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569' }}>
                    Demo Heuristic
                  </span>
                ) : (
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                    Live AI Backend (Port 8003)
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>
                {result.scam_type}
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fee2e2', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.8rem', fontWeight: 600 }}>
              <PhoneCall size={14} /> National Cybercrime Helpline: 1930
            </div>
          </div>

          {/* Transparent Educational Disclaimer */}
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
            <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            {result.disclaimer}
          </div>

          {/* Warning Signs Detected */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} color="#dc2626" /> Warning Signs & Red Flags
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {(result.warning_signs || []).map((sign, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    padding: '0.6rem 0.85rem',
                    background: result.risk_level === 'safe' ? 'var(--emerald-50)' : '#fef2f2',
                    border: `1px solid ${result.risk_level === 'safe' ? 'var(--emerald-100)' : '#fee2e2'}`,
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    color: result.risk_level === 'safe' ? 'var(--emerald-800)' : '#991b1b'
                  }}
                >
                  <span style={{ fontWeight: 700 }}>&bull;</span>
                  <span>{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-800)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#059669" /> Recommended Protective Next Steps
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.88rem', color: 'var(--slate-700)', lineHeight: '1.6' }}>
              {(result.recommended_actions || []).map((act, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>
                  {act}
                </li>
              ))}
            </ul>
          </div>

          {/* Advisory Sources */}
          {result.advisory_sources && result.advisory_sources.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Official Advisories:</span>
              {result.advisory_sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                >
                  <span>{src.replace('https://', '').replace('/', '')}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
