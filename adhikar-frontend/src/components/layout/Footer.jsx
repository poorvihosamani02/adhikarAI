import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        {/* Brand Column */}
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <span>A</span><i>✦</i>
            </span>
            <span className="brand-copy">
              <strong>adhikar<span>ai</span></strong>
              <small>Citizen empowerment, reimagined</small>
            </span>
          </Link>

          <p style={{ marginTop: '16px', maxWidth: '340px', color: '#77786f', fontSize: '14px', lineHeight: 1.7 }}>
            Because knowing your options<br />
            is the first step to using them.
          </p>

          <a className="footer-top" href="#top" onClick={scrollToTop} style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Back to top <span>↑</span>
          </a>
        </div>

        {/* Column 2: Citizen Tools */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', color: '#45463f', marginBottom: '14px' }}>
            CITIZEN TOOLS
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <li><Link to="/my-schemes" style={{ color: '#66685f' }}>My Schemes</Link></li>
            <li><Link to="/schemes" style={{ color: '#66685f' }}>Explore Benefits</Link></li>
            <li><Link to="/document-doctor" style={{ color: '#66685f' }}>Document Doctor</Link></li>
            <li><Link to="/documents" style={{ color: '#66685f' }}>Document Checklist</Link></li>
            <li><Link to="/scam-shield" style={{ color: '#66685f' }}>Scam Shield</Link></li>
            <li><Link to="/know-your-rights" style={{ color: '#66685f' }}>Know Your Rights</Link></li>
          </ul>
        </div>

        {/* Column 3: National Portals */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', color: '#45463f', marginBottom: '14px' }}>
            OFFICIAL PORTALS
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <li><a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#66685f' }}>Cyber Crime Portal ↗</a></li>
            <li><a href="https://nalsa.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#66685f' }}>NALSA Legal Aid ↗</a></li>
            <li><a href="https://rtionline.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#66685f' }}>RTI Online Portal ↗</a></li>
            <li><a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#66685f' }}>National Scholarship ↗</a></li>
            <li><a href="https://myscheme.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#66685f' }}>myScheme Portal ↗</a></li>
          </ul>
        </div>

        {/* Column 4: Helplines & Statutory Disclaimer */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.08em', color: '#45463f', marginBottom: '14px' }}>
            EMERGENCY HELPLINES
          </div>
          <p style={{ color: '#66685f', fontSize: '13px', lineHeight: 1.6, margin: '0 0 12px' }}>
            <strong>Cyber Fraud Helpline:</strong> 1930 (National)<br />
            <strong>Legal Aid Helpline:</strong> 15100 (NALSA)<br />
            <strong>Consumer Helpline:</strong> 1915 (National)
          </p>
          <div style={{ padding: '10px 14px', borderRadius: '12px', background: '#e1f1e3', fontSize: '12px', color: '#254c3c', fontWeight: 600 }}>
            Zero Hallucinations: Legal answers and criteria are grounded in official statutory acts and government gazettes.
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AdhikarAI • Citizen Empowerment Platform</span>
        <span>Built for clarity, access and informed choices.</span>
        <span>Always verify through official government sources.</span>
      </div>
    </footer>
  );
};

export default Footer;
