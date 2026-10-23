import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: { bg: 'var(--primary-50)', text: 'var(--primary-700)', border: 'var(--primary-100)' },
    saffron: { bg: 'var(--saffron-50)', text: 'var(--saffron-700)', border: 'var(--saffron-200)' },
    emerald: { bg: 'var(--emerald-50)', text: 'var(--emerald-700)', border: 'var(--emerald-200)' },
    purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="card card-hover" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem' }}>
      {Icon && (
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: scheme.bg,
            border: `1px solid ${scheme.border}`,
            color: scheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={24} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1.2, margin: '0.2rem 0' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
