import React, { forwardRef } from 'react';

/**
 * SandDriftBackground component matching the provided reference and code.
 * Creates an organic warm sand-drift atmosphere with blurred dunes, linear gradients,
 * and radial dot micro-texture that stays consistent even when scrolling down.
 */
const SandDriftBackground = forwardRef(
  ({ children, className = '', style = {}, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="sand-drift-background"
        className={`sand-drift-container ${className}`}
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          backgroundColor: 'var(--paper, #faf8f3)',
          color: 'var(--ink, #20211f)',
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SandDriftBackground.displayName = 'SandDriftBackground';

export { SandDriftBackground };
export default SandDriftBackground;
