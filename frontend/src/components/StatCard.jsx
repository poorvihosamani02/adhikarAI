import React from 'react';

export default function StatCard({ icon: Icon, title, value, subtitle, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'var(--primary-50)', border: 'var(--primary-200)', icon: 'var(--primary-600)' },
    saffron: { bg: 'var(--saffron-50)', border: 'var(--saffron-100)', icon: 'var(--saffron-600)' },
    emerald: { bg: 'var(--emerald-50)', border: 'var(--emerald-100)', icon: 'var(--emerald-600)' },
    slate: { bg: 'var(--slate-100)', border: 'var(--slate-200)', icon: 'var(--slate-700)' }
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Icon size={24} color={scheme.icon} />
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', fontFamily: 'var(--font-heading)', lineHeight: '1.2' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
