import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { profile } = useProfile();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const userLocation = profile?.state ? `${profile.state}, India` : 'Choose your state';
  const userCategory = profile?.category || 'Citizen Entitlements';

  return (
    <main>
      {/* =====================================================
           1. HERO SECTION (Friend's high-impact layout)
      ====================================================== */}
      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-icon" aria-hidden="true">✦</span>
            YOUR EVERYDAY CIVIC COMPANION
          </div>

          <h1>
            What you're entitled to should never be
            <em> hard to find.</em>
          </h1>

          <p className="hero-intro">
            Government benefits, scholarships, documents and rights — made easier to discover, understand and act on.
          </p>

          <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#666960', margin: '0 0 24px' }}>
            Your Rights. Your Benefits. Your Next Step. Explore government welfare schemes, pre-verify application documents, and protect yourself from cyber scams.
          </p>

          <div className="hero-buttons">
            <Link className="button button-dark" to="/my-schemes">
              My Schemes <span>→</span>
            </Link>

            <a className="text-link" href="#how-it-works">
              See how it works <span>↓</span>
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '18px' }}>
            <Link className="text-link" to="/schemes">
              Explore Schemes <span>→</span>
            </Link>

            <Link className="text-link" to="/know-your-rights">
              Legal Rights AI (Ask Genie) <span>→</span>
            </Link>
          </div>

          <div className="hero-proof">
            <div className="proof-icon-stack" aria-hidden="true">
              <span>⚖️</span>
              <span>📄</span>
              <span>🛡️</span>
            </div>

            <p>
              <strong>Less searching. More clarity.</strong><br />
              <span>Grounded in statutory acts &amp; official gazettes — zero hallucinations.</span>
            </p>
          </div>
        </div>

        {/* Hero Interactive Preview Art */}
        <div className="hero-art" aria-label="Preview of the AdhikarAI platform">
          <div className="art-orbit orbit-one"></div>
          <div className="art-orbit orbit-two"></div>

          <div className="float-note note-top">
            <span className="note-spark" aria-hidden="true">✦</span>
            <span>
              <strong>Made for real life</strong>
              <small>Clear steps, no red tape</small>
            </span>
          </div>

          <div className="benefit-window">
            <div className="window-top">
              <div className="window-brand">
                <span className="mini-mark">A</span> adhikarai
              </div>

              <span className="live-pill">
                <i></i> LIVE INTELLIGENCE
              </span>
            </div>

            <div className="window-heading">
              <span className="tiny-label">YOUR BENEFIT SNAPSHOT</span>
              <span className="window-avatar" id="home-avatar">{initials}</span>
            </div>

            <h3>Let's find what fits <span>you.</span></h3>

            <p className="window-subtitle">
              A few civic details narrow down 20+ national &amp; state schemes.
            </p>

            <div className="mini-profile">
              <div className="mini-profile-icon lavender" aria-hidden="true">
                📍
              </div>

              <div>
                <small>YOUR LOCATION</small>
                <strong id="home-state">{userLocation}</strong>
              </div>

              <span className="mini-check" aria-hidden="true">✓</span>
            </div>

            <div className="mini-profile">
              <div className="mini-profile-icon peach" aria-hidden="true">
                🎓
              </div>

              <div>
                <small>DEMOGRAPHIC PROFILE</small>
                <strong>{userCategory} • {profile?.occupation || 'Citizen'}</strong>
              </div>

              <span className="mini-check" aria-hidden="true">✓</span>
            </div>

            <div className="mini-match">
              <div className="match-top">
                <span>YOUR RECOMMENDED ACTION</span>
                <span className="match-stars" aria-hidden="true">✦✦✦</span>
              </div>

              <strong>Explore welfare entitlements</strong>

              <p>
                Evaluate your eligibility and pre-verify required documents before applying.
              </p>

              <Link to="/my-schemes">
                Start with My Schemes <span>→</span>
              </Link>
            </div>

            <div className="window-foot">
              <span aria-hidden="true">🛡️</span>
              Your privacy is safeguarded. No Aadhaar OTP or banking PIN ever requested.
            </div>
          </div>

          <div className="float-note note-bottom">
            <span className="note-shield" aria-hidden="true">✓</span>
            <span>
              <strong>Clarity, not confusion</strong>
              <small>Step-by-step citizen empowerment</small>
            </span>
          </div>

          <span className="decor-star star-one" aria-hidden="true">✦</span>
          <span className="decor-star star-two" aria-hidden="true">✦</span>
        </div>
      </section>

      {/* =====================================================
           2. CAPABILITIES MARQUEE TICKER
      ====================================================== */}
      <section className="ticker" aria-label="AdhikarAI capabilities">
        <div className="ticker-track">
          <span>✦ MY SCHEMES</span><b>•</b>
          <span>PREPARE DOCUMENTS</span><b>•</b>
          <span>SPOT SCAM SIGNALS</span><b>•</b>
          <span>UNDERSTAND YOUR RIGHTS</span><b>•</b>

          <span>✦ MY SCHEMES</span><b>•</b>
          <span>PREPARE DOCUMENTS</span><b>•</b>
          <span>SPOT SCAM SIGNALS</span><b>•</b>
          <span>UNDERSTAND YOUR RIGHTS</span><b>•</b>

          <span>✦ MY SCHEMES</span><b>•</b>
          <span>PREPARE DOCUMENTS</span><b>•</b>
          <span>SPOT SCAM SIGNALS</span><b>•</b>
          <span>UNDERSTAND YOUR RIGHTS</span>
        </div>
      </section>

      {/* =====================================================
           3. QUICK EXPLORATION CATEGORY GRID
      ====================================================== */}
      <section className="section-wrap" style={{ paddingTop: '80px', paddingBottom: '70px' }}>
        <div className="section-kicker" style={{ marginBottom: '14px' }}>
          EXPLORE CITIZEN MODULES
        </div>

        <div className="section-heading-row">
          <h2>
            Where would you like<br />
            <em>to begin?</em>
          </h2>

          <p>
            Choose a civic topic to dive straight in — each takes you to a verified tool connected to our backend &amp; AI services.
          </p>
        </div>

        <div
          className="home-quick-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px'
          }}
        >
          {/* Schemes & Benefits */}
          <Link
            to="/schemes"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '26px',
              borderRadius: '20px',
              background: '#e1f1e3',
              border: '1px solid #c8e5cc',
              transition: 'transform .2s, box-shadow .2s',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '32px' }} aria-hidden="true">🌾</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', letterSpacing: '-.03em' }}>
              Explore Benefits &amp; Schemes
            </strong>
            <span style={{ color: '#4f6b52', fontSize: '14px', lineHeight: 1.65 }}>
              Browse 20+ government schemes across Agriculture, Education, Healthcare, and Livelihood.
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#325c38' }}>
              View all schemes →
            </span>
          </Link>

          {/* Smart Profiler */}
          <Link
            to="/my-schemes"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '26px',
              borderRadius: '20px',
              background: '#eeebff',
              border: '1px solid #ded3fa',
              transition: 'transform .2s, box-shadow .2s',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '32px' }} aria-hidden="true">🎯</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', letterSpacing: '-.03em' }}>
              My Schemes
            </strong>
            <span style={{ color: '#6f6e7b', fontSize: '14px', lineHeight: 1.65 }}>
              Answer a few questions to match your exact demographic criteria with eligible central and state schemes.
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#57428f' }}>
              View My Schemes →
            </span>
          </Link>

          {/* Document Doctor */}
          <Link
            to="/document-doctor"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '26px',
              borderRadius: '20px',
              background: '#fff0e7',
              border: '1px solid #f4d8c5',
              transition: 'transform .2s, box-shadow .2s',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '32px' }} aria-hidden="true">📄</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', letterSpacing: '-.03em' }}>
              Document Doctor
            </strong>
            <span style={{ color: '#7a5840', fontSize: '14px', lineHeight: 1.65 }}>
              Pre-verify your certificates and IDs against official rule checklists before submitting an application.
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#9d5835' }}>
              Verify documents →
            </span>
          </Link>

          {/* Scam Shield */}
          <Link
            to="/scam-shield"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '26px',
              borderRadius: '20px',
              background: '#dfeaff',
              border: '1px solid #cbdcf8',
              transition: 'transform .2s, box-shadow .2s',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '32px' }} aria-hidden="true">🛡️</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', letterSpacing: '-.03em' }}>
              Scam Shield Defense
            </strong>
            <span style={{ color: '#4a5e80', fontSize: '14px', lineHeight: 1.65 }}>
              Paste suspicious SMS messages, emails, or scholarship links to detect red flags and fraud patterns.
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#38568c' }}>
              Check message →
            </span>
          </Link>

          {/* Know Your Rights */}
          <Link
            to="/know-your-rights"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '26px',
              borderRadius: '20px',
              background: '#eeebff',
              border: '1px solid #ded3fa',
              transition: 'transform .2s, box-shadow .2s',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '32px' }} aria-hidden="true">⚖️</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', letterSpacing: '-.03em' }}>
              Know Your Rights (Ask Genie)
            </strong>
            <span style={{ color: '#6f6e7b', fontSize: '14px', lineHeight: 1.65 }}>
              Ask statutory questions on RTI, consumer complaints, labor laws, and get verified citations.
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#57428f' }}>
              Ask legal question →
            </span>
          </Link>

          {/* Document Checklist */}
          <Link
            to="/documents"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '26px',
              borderRadius: '20px',
              background: '#e1f1e3',
              border: '1px solid #c8e5cc',
              transition: 'transform .2s, box-shadow .2s',
              color: 'inherit'
            }}
          >
            <span style={{ fontSize: '32px' }} aria-hidden="true">✓</span>
            <strong style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', letterSpacing: '-.03em' }}>
              Checklist &amp; Readiness
            </strong>
            <span style={{ color: '#4f6b52', fontSize: '14px', lineHeight: 1.65 }}>
              Keep track of mandatory and conditional documents required for each government application.
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#325c38' }}>
              Open checklist →
            </span>
          </Link>
        </div>
      </section>

      {/* =====================================================
           4. PROCESS OVERVIEW: HOW IT WORKS
      ====================================================== */}
      <section className="section-wrap" id="how-it-works" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
        <div className="process-overview">
          <div className="process-overview-heading">
            <div>
              <div className="section-kicker">FOUR STEPS TO CIVIC EMPOWERMENT</div>
              <h2>
                How AdhikarAI works<br />
                <em>for every citizen</em>
              </h2>
            </div>
            <p>
              A straightforward process designed to demystify complex welfare bureaucracy and safeguard statutory rights.
            </p>
          </div>

          <ol className="process-steps">
            <li>
              <span className="process-step-number">01</span>
              <h3>Tell us a few basic details</h3>
              <p>Share your state, age group, education, and household category. No sensitive data or documents leave your control.</p>
              <Link to="/my-schemes" className="arrow-link">
                View My Schemes <span>→</span>
              </Link>
            </li>

            <li>
              <span className="process-step-number">02</span>
              <h3>Discover matched welfare benefits</h3>
              <p>Explore matching scholarships, agricultural grants, and welfare subsidies tailored directly to your situation.</p>
              <Link to="/schemes" className="arrow-link">
                Browse scheme catalog <span>→</span>
              </Link>
            </li>

            <li>
              <span className="process-step-number">03</span>
              <h3>Pre-verify requirements</h3>
              <p>Review checklists and test certificates through Document Doctor before approaching public service centers.</p>
              <Link to="/document-doctor" className="arrow-link">
                Check documents <span>→</span>
              </Link>
            </li>

            <li>
              <span className="process-step-number">04</span>
              <h3>Stay protected &amp; informed</h3>
              <p>Inspect suspicious SMS or calls with Scam Shield and consult Legal Genie for citation-grounded statutory answers.</p>
              <Link to="/scam-shield" className="arrow-link">
                Review safety tools <span>→</span>
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {/* =====================================================
           5. STATS & AI PLATFORM HEALTH
      ====================================================== */}
      <section className="section-wrap" style={{ paddingTop: '10px', paddingBottom: '90px' }}>
        <div
          style={{
            padding: '38px',
            borderRadius: '24px',
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
            <div>
              <span className="tiny-label">VERIFIED CIVIC DATA PLATFORM</span>
              <h3 style={{ margin: '6px 0 0', fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 800, letterSpacing: '-.03em' }}>
                Full-Stack Architecture &amp; Microservices
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#e1f1e3', color: '#254c3c', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#254c3c' }}></span>
                Node.js Gateway :3000
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#eeebff', color: '#44317a', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#57428f' }}></span>
                Legal RAG AI :8001
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#fff0e7', color: '#7a5840', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b07050' }}></span>
                Doc Doctor :8002
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: '#dfeaff', color: '#2b477a', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b6ab5' }}></span>
                Scam Shield :8003
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              borderTop: '1px solid var(--line, #e8e4dc)',
              paddingTop: '24px'
            }}
          >
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 800, color: '#20211f' }}>20+</div>
              <div style={{ color: '#77786f', fontSize: '13px', marginTop: '4px' }}>Curated Central &amp; State Schemes</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 800, color: '#20211f' }}>30+</div>
              <div style={{ color: '#77786f', fontSize: '13px', marginTop: '4px' }}>Document Verification Rules</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 800, color: '#20211f' }}>22+</div>
              <div style={{ color: '#77786f', fontSize: '13px', marginTop: '4px' }}>Cyber Fraud Heuristic Patterns</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '32px', fontWeight: 800, color: '#20211f' }}>100%</div>
              <div style={{ color: '#77786f', fontSize: '13px', marginTop: '4px' }}>Statutory Acts &amp; Gazette Grounded</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
