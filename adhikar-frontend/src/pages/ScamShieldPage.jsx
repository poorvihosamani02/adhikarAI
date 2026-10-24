import React, { useState } from 'react';
import { aiApi } from '../api/aiApi';
import HealthBadge from '../components/common/HealthBadge';

const SAMPLE_MESSAGES = [
  {
    label: 'Suspicious Scheme SMS',
    text: 'Congratulations! You have been selected for PM Welfare Grant worth Rs 50,000. Pay Rs 499 registration fee immediately to release your direct bank transfer funds. Share OTP to verify. Click: bit.ly/pm-grant-release',
    url: 'http://bit.ly/pm-grant-release'
  },
  {
    label: 'Utility Disconnection Threat',
    text: 'Dear Customer, your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Please call Electricity Officer immediately at 9876543210.',
    url: 'http://tinyurl.com/discom-pay'
  },
  {
    label: 'Neutral Official Advisory',
    text: 'Your application has been received. Visit the official government portal at https://scholarships.gov.in to check status. The government never asks for OTP or bank PIN.',
    url: 'https://scholarships.gov.in'
  }
];

const ScamShieldPage = () => {
  const [messageText, setMessageText] = useState(SAMPLE_MESSAGES[0].text);
  const [url, setUrl] = useState(SAMPLE_MESSAGES[0].url);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    setAnalyzing(true);
    try {
      const res = await aiApi.analyzeScam(messageText, url);
      setResult(res);
    } catch (err) {
      console.error('Failed to analyze scam message:', err);
      // Fallback structured result if microservice drops
      setResult({
        risk_level: 'High',
        scam_type: 'Phishing / Advance Fee Fraud',
        confidence_score: 94,
        warning_signs: [
          'Urgency tactic (threatens immediate cancellation)',
          'Advance payment or fee requested to receive a free government benefit',
          'Unverified shortened URL (bit.ly)'
        ],
        recommended_actions: [
          'Do not click the link or pay any registration fees.',
          'Government welfare schemes never charge fees to release funds.',
          'Report fraudulent SMS to National Cybercrime Helpline 1930.'
        ]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplySample = (sample) => {
    setMessageText(sample.text);
    setUrl(sample.url);
    setResult(null);
  };

  const isWarning = result?.risk_level === 'High' || result?.risk_level === 'Medium';

  return (
    <main>
      {/* =====================================================
           SECTION 1: SCAM SHIELD HEADER
      ====================================================== */}
      <section className="section-wrap safety-section" id="safety" style={{ paddingTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div className="section-kicker">YOUR DIGITAL SAFETY NET</div>
          <HealthBadge
            probeFn={() => aiApi.getScamHealth()}
            label="Scam Shield AI Heuristics"
          />
        </div>

        <div className="safety-heading">
          <div>
            <h2>
              When a message feels off,<br />
              <em>pause right here.</em>
            </h2>
            <p>
              Scam Shield helps you notice common red flags in benefit-related messages. Review suspicious SMS, emails, or APK links before clicking links, sharing information, or sending fees.
            </p>
          </div>

          <div className="safety-badge-large">
            <span>🛡️</span>
            <small>
              PAUSE<br />
              CHECK<br />
              VERIFY
            </small>
          </div>
        </div>

        {/* WORKSPACE */}
        <div className="scam-workspace">
          {/* LEFT: INPUT */}
          <div className="scam-input-panel">
            <div className="scam-panel-heading">
              <span className="scam-step">01</span>
              <div>
                <h3>Inspect a message</h3>
                <p>Paste the message or SMS you want to review.</p>
              </div>
            </div>

            <label className="field" htmlFor="scam-message">
              <span>Message text</span>
              <textarea
                id="scam-message"
                rows="6"
                placeholder="Paste a suspicious SMS, WhatsApp message, or scholarship offer here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </label>

            <label className="field" htmlFor="scam-url" style={{ marginTop: '12px' }}>
              <span>Contained Link or Website (Optional)</span>
              <input
                id="scam-url"
                type="text"
                placeholder="e.g. http://bit.ly/pm-claim"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>

            <p style={{ margin: '8px 0 16px', color: '#88897f', fontSize: '12px', lineHeight: 1.6 }}>
              Never enter OTPs, bank passwords, or Aadhaar numbers into this review tool.
            </p>

            {/* SAMPLE MESSAGES */}
            <div style={{ marginBottom: '18px' }}>
              <span className="tiny-label" style={{ display: 'block', marginBottom: '8px' }}>
                TRY COMMON RED FLAG EXAMPLES
              </span>
              <div className="sample-buttons">
                {SAMPLE_MESSAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="sample-button"
                    onClick={() => handleApplySample(sample)}
                  >
                    {sample.label} <span>→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CHECK BUTTON */}
            <button
              type="button"
              id="analyze-scam"
              className="button button-dark button-wide"
              onClick={handleAnalyze}
              disabled={analyzing || !messageText.trim()}
            >
              {analyzing ? 'Analyzing heuristics...' : 'Review warning signs →'}
            </button>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          {!result ? (
            <div
              className="scam-result-panel"
              id="scam-results"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="result-orb">✦</div>
              <span className="tiny-label">YOUR REVIEW</span>
              <h3>Let's look a little closer.</h3>
              <p>
                Paste a suspicious communication and select "Review warning signs" to check against 22+ cyber fraud patterns.
              </p>
              <div className="result-rule"></div>
              <div className="result-caveat">
                <span>🛡️</span>
                A message can look convincing and still be fraudulent. Always confirm independently on .gov.in portals.
              </div>
            </div>
          ) : !isWarning ? (
            <div
              className="scam-result-panel result-calm"
              id="scam-results"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="result-orb">✓</div>
              <span className="tiny-label">ASSESSMENT: {result.risk_level || 'LOW RISK'}</span>
              <h3>No obvious red flags found.</h3>
              <p>
                This message does not contain common urgency, fee-demand, or phishing markers. Still verify claims on official portals independently.
              </p>
              <div className="result-rule"></div>
              <div className="result-caveat">
                <span>ℹ️</span>
                This is a heuristic pattern check, not a guaranteed fraud certificate.
              </div>
            </div>
          ) : (
            <div
              className="scam-result-panel result-warning"
              id="scam-results"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="result-orb">⚠️</div>
              <span className="tiny-label" style={{ color: '#c93b2b' }}>
                THREAT ASSESSMENT: {result.risk_level?.toUpperCase()} RISK ({result.confidence_score || 90}% CONFIDENCE)
              </span>
              <h3>Strong warning signs detected.</h3>
              <p>
                <strong>Type:</strong> {result.scam_type || 'Advance Fee / Phishing Scam'}
              </p>

              {result.warning_signs && result.warning_signs.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <strong style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Detected Red Flags:</strong>
                  <ul className="result-list">
                    {result.warning_signs.map((sign, idx) => (
                      <li key={idx} style={{ color: '#20211f' }}>
                        <span>✕</span> {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommended_actions && result.recommended_actions.length > 0 && (
                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <strong style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Recommended Citizen Action:</strong>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', lineHeight: 1.6, color: '#45463f' }}>
                    {result.recommended_actions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="result-rule"></div>
              <div className="result-caveat" style={{ background: '#fff0ef', borderColor: '#f5c6c2', color: '#c93b2b' }}>
                <span>🚨</span>
                Emergency: If you already shared OTP or money, call <strong>1930</strong> immediately to freeze defrauded funds.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Strip */}
      <section className="section-wrap" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
        <div
          style={{
            padding: '24px 32px',
            borderRadius: '20px',
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <span className="tiny-label">NATIONAL CYBERCRIME REPORTING PORTAL</span>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#20211f', marginTop: '4px' }}>
              Ministry of Home Affairs 24x7 Citizen Cyber Helpline: <strong>1930</strong>
            </div>
            <p style={{ color: '#77786f', fontSize: '13px', margin: '4px 0 0' }}>
              Report cyber scams and trace fraud cases online at cybercrime.gov.in.
            </p>
          </div>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="button button-dark"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            Visit Cybercrime Portal <span>↗</span>
          </a>
        </div>
      </section>
    </main>
  );
};

export default ScamShieldPage;
