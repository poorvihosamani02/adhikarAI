import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, PhoneCall, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Column 1: Brand & Civic Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div className="brand-dots">
                <div className="brand-dot" />
                <div className="brand-dot" />
                <div className="brand-dot" />
                <div className="brand-dot" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
                adhikar<span style={{ opacity: 0.85, fontWeight: 600 }}>.ai</span>
              </span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '320px' }}>
              Democratizing statutory awareness, welfare scheme eligibility, and cyber fraud defense for every Indian citizen.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                color: '#ffffff',
                fontWeight: 600
              }}
            >
              <PhoneCall size={14} />
              <span>Cybercrime Helpline: <strong>1930</strong> (24x7)</span>
            </div>
          </div>

          {/* Column 2: Citizen Modules */}
          <div>
            <h4 className="footer-title">Citizen Tools</h4>
            <ul className="footer-links">
              <li>
                <Link to="/find-schemes" className="footer-link">
                  Find My Schemes
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="footer-link">
                  Government Schemes
                </Link>
              </li>
              <li>
                <Link to="/know-your-rights" className="footer-link">
                  Legal Rights AI (Ask Genie)
                </Link>
              </li>
              <li>
                <Link to="/document-doctor" className="footer-link">
                  Document Doctor
                </Link>
              </li>
              <li>
                <Link to="/scam-shield" className="footer-link">
                  Scam Shield Defense
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                  Citizen Eligibility Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: National Portals & Helplines */}
          <div>
            <h4 className="footer-title">Official Portals</h4>
            <ul className="footer-links">
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>Cyber Crime Portal</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a
                  href="https://nalsa.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>NALSA Legal Aid</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a
                  href="https://rtionline.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>RTI Online Portal</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>National Scholarship Portal</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a
                  href="https://myscheme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>myScheme Portal</span>
                  <ArrowUpRight size={13} />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Disclaimer */}
          <div>
            <h4 className="footer-title">Statutory Policy</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.8125rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              <strong>Zero Hallucinations:</strong> Legal answers and document validation rules are strictly
              grounded in published statutory acts and official ministry gazettes.
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
              AdhikarAI is an independent citizen assistance technology. We never ask for Aadhaar OTPs or banking PINs.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} AdhikarAI. Built for Indian Citizen Welfare &amp; Statutory Empowerment.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>20 Schemes &bull; 30 Document Rules &bull; 22 Scam Patterns</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>100% Free Public Civic Tool</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
