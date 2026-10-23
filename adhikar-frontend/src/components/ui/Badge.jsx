import React from 'react';

const Badge = ({ children, variant = 'slate', icon: Icon, className = '', title }) => {
  return (
    <span className={`badge badge-${variant} ${className}`} title={title}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default Badge;
