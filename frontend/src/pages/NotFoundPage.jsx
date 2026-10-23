import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <Compass size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Page Not Found</h1>
      <p style={{ fontSize: '0.95rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
        The requested page does not exist in the AdhikarAI portal.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} /> Return to Dashboard
      </Link>
    </div>
  );
}
