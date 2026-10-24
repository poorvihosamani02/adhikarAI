import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * FloatingAsk button matching friend's design:
 * Fixed bottom-right pill button with sparkle icon, subtle bounce hover, and mint backdrop.
 * Navigates to the statutory Q&A / Know Your Rights page.
 */
const FloatingChatbot = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className="floating-ask"
      id="floating-ask"
      onClick={() => navigate('/know-your-rights')}
      title="Ask AdhikarAI about rights, benefits, and documents"
      aria-label="Ask AdhikarAI"
    >
      <span>✨</span> Ask AdhikarAI
    </button>
  );
};

export default FloatingChatbot;
