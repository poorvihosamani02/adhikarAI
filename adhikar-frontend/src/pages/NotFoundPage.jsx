import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Home, Search, ArrowLeft, ShieldAlert } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ maxWidth: '640px', marginTop: '3rem', textAlign: 'center' }}>
      <div className="card" style={{ padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--primary-50)',
            color: 'var(--primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-900)', lineHeight: 1 }}>
          404
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
          Page or Entitlement Not Found
        </h2>

        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '440px' }}>
          The URL you requested does not correspond to a valid AdhikarAI page or cataloged welfare scheme.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
          <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
            Return Home
          </Button>
          <Button variant="outline" icon={Search} onClick={() => navigate('/schemes')}>
            Browse Schemes
          </Button>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
