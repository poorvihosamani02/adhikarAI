import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main>
      <div className="section-wrap" style={{ maxWidth: '640px', margin: '70px auto', textAlign: 'center' }}>
        <div
          style={{
            background: 'var(--white, #fffefa)',
            border: '1px solid var(--line, #e8e4dc)',
            borderRadius: '24px',
            padding: '50px 30px',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✦</div>

          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '3.5rem', fontWeight: 900, color: '#20211f', lineHeight: 1 }}>
            404
          </div>

          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 800, margin: '14px 0 10px' }}>
            Page or Entitlement Not Found
          </h2>

          <p style={{ color: '#77786f', fontSize: '14px', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 28px' }}>
            The civic page you requested does not exist or may have been moved. Explore our cataloged schemes or return home.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="button button-dark">
              Return Home <span>→</span>
            </Link>
            <Link to="/schemes" className="sample-button" style={{ padding: '10px 18px', fontSize: '14px', fontWeight: 700 }}>
              Explore Schemes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
