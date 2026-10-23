import React from 'react';

/**
 * ChatbotIcon matches the line-art headphone assistant icon from reference picture 4
 */
const ChatbotIcon = ({ size = 32, color = 'currentColor', className = '', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Headphone Arch Over Head */}
      <path
        d="M23 48 C23 26 34 16 50 16 C66 16 77 26 77 48"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Earcup */}
      <rect
        x="17"
        y="38"
        width="10"
        height="22"
        rx="5"
        stroke={color}
        strokeWidth="5"
        fill="none"
      />

      {/* Right Earcup */}
      <rect
        x="73"
        y="38"
        width="10"
        height="22"
        rx="5"
        stroke={color}
        strokeWidth="5"
        fill="none"
      />

      {/* Robot Rounded Head */}
      <rect
        x="29"
        y="28"
        width="42"
        height="40"
        rx="12"
        stroke={color}
        strokeWidth="5"
        fill="none"
      />

      {/* Left Eye */}
      <circle cx="43" cy="45" r="2.5" fill={color} />

      {/* Right Eye */}
      <circle cx="57" cy="45" r="2.5" fill={color} />

      {/* Happy Smile */}
      <path
        d="M45 52 Q50 57 55 52"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Microphone Boom Arm */}
      <path
        d="M74 58 C74 68 64 74 54 74"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Microphone Capsule */}
      <rect
        x="43"
        y="70"
        width="12"
        height="7"
        rx="3.5"
        stroke={color}
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
};

export default ChatbotIcon;
