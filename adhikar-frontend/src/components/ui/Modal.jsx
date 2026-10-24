import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '640px' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(32, 33, 31, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        className="modal-content"
        style={{
          maxWidth,
          width: '100%',
          background: '#fffefa',
          border: '1px solid #e8e4dc',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 24px 70px rgba(48, 45, 36, .18)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid #e8e4dc',
            marginBottom: '18px'
          }}
        >
          <h3 style={{ margin: 0, fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, color: '#20211f' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#77786f',
              fontSize: '18px',
              padding: '4px 8px',
              borderRadius: '8px'
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div
            style={{
              paddingTop: '18px',
              borderTop: '1px solid #e8e4dc',
              marginTop: '18px'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
