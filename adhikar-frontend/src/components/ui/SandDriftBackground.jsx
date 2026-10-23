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
          isolation: 'isolate',
          backgroundColor: '#F4EDE4',
          minHeight: '100vh',
          width: '100%',
          ...style
        }}
        {...props}
      >
        {/* Fixed Base Linear Gradient: #FAF4EC -> #F0E4D6 -> #E8D8C8 */}
        <div
          aria-hidden="true"
          style={{
            pointerEvents: 'none',
            position: 'fixed',
            inset: 0,
            zIndex: -10,
            background: 'linear-gradient(180deg, #FAF4EC 0%, #F0E4D6 52%, #E8D8C8 100%)'
          }}
        />

        {/* Fixed Organic Dunes / Blurred Sand Blobs */}
        <div
          aria-hidden="true"
          style={{
            pointerEvents: 'none',
            position: 'fixed',
            inset: 0,
            zIndex: -10,
            overflow: 'hidden'
          }}
        >
          {/* Dune Blob 1: Bottom-Left #E8C9A8 */}
          <div
            style={{
              position: 'absolute',
              bottom: '-28%',
              left: '-12%',
              height: '62%',
              width: '88%',
              borderRadius: '100%',
              backgroundColor: '#E8C9A8',
              opacity: 0.7,
              filter: 'blur(32px)'
            }}
          />

          {/* Dune Blob 2: Bottom-Center #DDB892 */}
          <div
            style={{
              position: 'absolute',
              bottom: '-22%',
              left: '18%',
              height: '48%',
              width: '72%',
              borderRadius: '100%',
              backgroundColor: '#DDB892',
              opacity: 0.55,
              filter: 'blur(30px)'
            }}
          />

          {/* Dune Blob 3: Bottom-Right #C9A882 */}
          <div
            style={{
              position: 'absolute',
              right: '-8%',
              bottom: '-18%',
              height: '54%',
              width: '64%',
              borderRadius: '100%',
              backgroundColor: '#C9A882',
              opacity: 0.45,
              filter: 'blur(28px)'
            }}
          />

          {/* Dune Blob 4: Top-Right Highlight #F5E6D3 */}
          <div
            style={{
              position: 'absolute',
              top: '8%',
              right: '12%',
              height: '34%',
              width: '42%',
              borderRadius: '100%',
              backgroundColor: '#F5E6D3',
              opacity: 0.8,
              filter: 'blur(36px)'
            }}
          />
        </div>

        {/* Fixed Radial Grain / Dot Micro-Texture */}
        <div
          aria-hidden="true"
          style={{
            pointerEvents: 'none',
            position: 'fixed',
            inset: 0,
            zIndex: -10,
            backgroundImage: 'radial-gradient(circle at center, #8B7355 1px, transparent 1px)',
            backgroundSize: '3px 3px',
            opacity: 0.05
          }}
        />

        {children}
      </div>
    );
  }
);

SandDriftBackground.displayName = 'SandDriftBackground';

export { SandDriftBackground };
export default SandDriftBackground;
