import React from 'react';

const HealthBadge = ({ label, port, status = 'online' }) => {
  return (
    <div className="health-pill" title={`Port ${port}: ${status}`}>
      <span className={`health-dot ${status === 'online' ? 'online' : 'offline'}`} />
      <span>{label}</span>
      {port && <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>:{port}</span>}
    </div>
  );
};

export default HealthBadge;
