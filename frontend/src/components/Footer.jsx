import React from 'react';
import { Shield, Database, Cpu, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', borderTop: '1px solid #1e293b', padding: '2.5rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
              <Shield size={20} color="#3b82f6" />
              AdhikarAI Practice Platform
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>
              Citizen Schemes Intelligence &bull; AI Document Doctor &bull; Scam Shield &bull; Know Your Rights
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}>
              <Database size={14} /> 4 Original Datasets Preserved
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
              <Cpu size={14} /> 3 Python AI Services
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24' }}>
              <CheckCircle size={14} /> Clean Architecture
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          <p>
            AdhikarAI Practice Environment for Hackathon Preparation. Backend directory left empty for your Node.js implementation.
          </p>
          <p>
            No real official legal advice or government eligibility guarantee implied.
          </p>
        </div>
      </div>
    </footer>
  );
}
