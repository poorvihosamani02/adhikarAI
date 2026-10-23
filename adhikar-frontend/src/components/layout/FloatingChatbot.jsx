import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ChatbotIcon from '../ui/ChatbotIcon';

/**
 * FloatingChatbot is persistent on all pages at the bottom-right corner.
 * Clicking it navigates to the Legal Rights AI / Know Your Rights page.
 * Styled matching the line-art chatbot in reference picture 4 with a rounded white hover effect.
 */
const FloatingChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isCurrentPage = location.pathname === '/know-your-rights';

  const handleClick = () => {
    navigate('/know-your-rights');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexDirection: 'row-reverse'
      }}
    >
      {/* 1. Main Floating Round Button */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open Legal Rights AI Assistant"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: isCurrentPage ? '2.5px solid var(--coral-600)' : '1.5px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isHovered
            ? '0 16px 36px -6px rgba(216, 109, 78, 0.35), 0 6px 16px rgba(0, 0, 0, 0.08)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 3px 8px rgba(0, 0, 0, 0.06)',
          transform: isHovered ? 'translateY(-4px) scale(1.06)' : 'translateY(0) scale(1)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: 0,
          outline: 'none'
        }}
      >
        {/* Chatbot SVG Icon from Reference 4 */}
        <ChatbotIcon
          size={36}
          color={isHovered ? 'var(--coral-600)' : 'var(--charcoal-900)'}
          style={{
            transition: 'color 0.25s ease, transform 0.25s ease',
            transform: isHovered ? 'rotate(-3deg) scale(1.05)' : 'none'
          }}
        />

        {/* Live Green Online Indicator Dot */}
        <span
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid #ffffff',
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
          }}
        />
      </button>

      {/* 2. Interactive Tooltip / Label Pill on Hover */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: '#ffffff',
          color: 'var(--charcoal-900)',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          fontSize: '0.825rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          cursor: 'pointer',
          opacity: isHovered ? 1 : 0.85,
          transform: isHovered ? 'translateX(-2px)' : 'translateX(0)',
          transition: 'all 0.25s ease',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          pointerEvents: 'auto'
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: 'var(--coral-500)',
            display: 'inline-block'
          }}
        />
        <span>Legal Rights AI</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--charcoal-400)', fontWeight: 500 }}>
          (Ask Genie)
        </span>
      </div>
    </div>
  );
};

export default FloatingChatbot;
