import React, { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  ArrowUpRight
} from 'lucide-react';
import { aiApi } from '../api/aiApi';
import Badge from '../components/ui/Badge';
import HealthBadge from '../components/common/HealthBadge';

const SAMPLE_MESSAGES = [
  {
    label: 'Sample 1: Power Disconnection Threat',
    text: 'Dear Customer, your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Please call Electricity Officer immediately at 9876543210.',
    url: 'http://tinyurl.com/discom-pay'
  },
  {
    label: 'Sample 2: Fake Scholarship APK',
    text: 'Congratulations! You have been awarded National PM Higher Education Grant worth Rs 50,000. Download and install scholarship-portal.apk to claim your DBT grant immediately.',
    url: 'http://pm-grant-scholarship.xyz/app.apk'
  },
  {
    label: 'Sample 3: Legitimate Government Advisory',
    text: 'PIB Fact Check: Beware of fraudulent messages promising government jobs. Official vacancies are published exclusively on official ministry websites (.gov.in).',
    url: 'https://factcheck.pib.gov.in'
  }
];

const ScamShieldPage = () => {
  const [messageText, setMessageText] = useState(SAMPLE_MESSAGES[0].text);
  const [url, setUrl] = useState(SAMPLE_MESSAGES[0].url);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || messageText.length < 2 || messageText.length > 5000) return;

    setAnalyzing(true);
    try {
      const res = await aiApi.analyzeScam(messageText, url);
      setResult(res);
    } catch (err) {
      console.error('Failed to analyze scam message:', err);
      alert(err.message || 'Error occurred while contacting Scam Shield service.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySample = (sample) => {
    setMessageText(sample.text);
    setUrl(sample.url);
    setResult(null);
  };

  const charCount = messageText.length;
  const isCharWarning = charCount > 4500;
  const isCharError = charCount > 5000;

  return (
    <div className="container" style={{ maxWidth: '1040px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Emergency Helpline Strip */}
      <div
        style={{
          background: '#ffffff',
          color: 'var(--charcoal-900)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--danger-50)',
              color: 'var(--danger-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PhoneCall size={18} />
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            Victim of cyber financial fraud? Call the <strong>National Cyber Crime Helpline at 1930</strong> immediately.
          </span>
        </div>
        <a
          href="https://cybercrime.gov.in"
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
        >
          <span>cybercrime.gov.in</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* 2. Header */}
      <div>
        <span className="eyebrow-text">CYBER DEFENSE</span>
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em' }}>
          AdhikarAI Scam Shield.
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.05rem', maxWidth: '780px', marginTop: '0.4rem' }}>
          Protect yourself and your family from power bill disconnection threats, fake scholarship APKs, and lottery
          phishing messages.
        </p>
      </div>

      {/* 3. Input Workspace & Output Grid */}
      <div className="grid-2">
        {/* Left Column: Form & Sample Buttons (Clean White Card) */}
        <div className="card" style={{ padding: '2.25rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
              Inspect a Suspicious Message
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--charcoal-500)', marginTop: '0.2rem' }}>
              Paste SMS, WhatsApp notice, or social message text for heuristic evaluation.
            </p>
          </div>

          {/* Sample Prompts */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--charcoal-500)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Try Verified Test Samples:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {SAMPLE_MESSAGES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(sample)}
                  style={{
                    background: 'var(--charcoal-50)',
                    border: '1px solid var(--charcoal-100)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.5rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.8125rem',
                    color: 'var(--charcoal-800)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 150ms ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--coral-500)';
                    e.currentTarget.style.color = 'var(--coral-600)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--charcoal-100)';
                    e.currentTarget.style.color = 'var(--charcoal-800)';
                  }}
                >
                  <span>{sample.label}</span>
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label form-label-required">Suspicious Message Text</label>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: isCharError ? 'var(--danger-600)' : isCharWarning ? 'var(--coral-600)' : 'var(--charcoal-400)'
                  }}
                >
                  {charCount} / 5000
                </span>
              </div>
              <textarea
                rows={5}
                required
                className={`form-textarea ${isCharError ? 'has-error' : ''}`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Paste the message content received on SMS or WhatsApp..."
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Suspicious Link / URL (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. http://tinyurl.com/... or suspicious .xyz domain"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <LinkIcon
                  size={16}
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--charcoal-400)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!messageText.trim() || isCharError || analyzing}
              className="btn btn-block"
              style={{
                background: 'var(--coral-600)',
                color: '#ffffff',
                fontSize: '1rem',
                padding: '0.9rem'
              }}
            >
              <span>{analyzing ? 'Scanning Heuristics...' : 'Analyze Message with Scam Shield'}</span>
              {!analyzing && <ArrowUpRight size={17} />}
            </button>
          </form>
        </div>

        {/* Right Column: Threat Analysis Card */}
        <div>
          {result ? (
            <div
              className="card"
              style={{
                padding: '2.25rem',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                borderLeft: `5px solid ${
                  result.risk_level === 'high'
                    ? 'var(--danger-500)'
                    : result.risk_level === 'safe'
                    ? 'var(--emerald-500)'
                    : 'var(--amber-500)'
                }`
              }}
            >
              {/* Risk Badge & Confidence */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span
                  className={`badge ${
                    result.risk_level === 'high'
                      ? 'badge-danger'
                      : result.risk_level === 'safe'
                      ? 'badge-emerald'
                      : 'badge-amber'
                  }`}
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem', fontWeight: 800 }}
                >
                  {result.risk_level === 'high'
                    ? 'HIGH RISK FRAUD DETECTED'
                    : result.risk_level === 'safe'
                    ? 'OFFICIAL / LOW RISK'
                    : 'SUSPICIOUS / UNVERIFIED'}
                </span>

                <div style={{ fontSize: '0.85rem', color: 'var(--charcoal-500)', fontWeight: 700 }}>
                  Confidence: <strong>{Math.round(result.confidence_score * 100)}%</strong>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--charcoal-900)' }}>
                  {result.scam_type}
                </h3>
              </div>

              {/* Warning Signs */}
              {result.warning_signs && result.warning_signs.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--danger-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertTriangle size={16} /> Red Flags Identified:
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    {result.warning_signs.map((sign, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--charcoal-700)' }}>
                        <AlertCircle size={15} style={{ color: 'var(--danger-500)', flexShrink: 0, marginTop: '2px' }} />
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Actions */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--charcoal-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--emerald-600)' }} /> Recommended Protective Actions:
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  {result.recommended_actions.map((act, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--charcoal-800)', fontWeight: 600 }}>
                      <CheckCircle2 size={15} style={{ color: 'var(--emerald-600)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.advisory_sources && result.advisory_sources.length > 0 && (
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--charcoal-100)', fontSize: '0.78rem', color: 'var(--charcoal-500)' }}>
                  <strong>Advisory Grounding:</strong> {result.advisory_sources.join(' &bull; ')}
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--charcoal-400)', fontStyle: 'italic' }}>
                {result.disclaimer}
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
                <ShieldAlert size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--charcoal-900)' }}>
                Scam Threat Analysis Ready
              </h3>
              <p style={{ color: 'var(--charcoal-600)', fontSize: '0.9rem', maxWidth: '360px', lineHeight: 1.6 }}>
                Paste an SMS or test one of the verified samples on the left. Scam Shield will evaluate urgent disconnection
                threats, lookalike domains, and advance fee requests.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScamShieldPage;
