import React from 'react';
import './ThinkingIndicator.css';

const ThinkingIndicator: React.FC = () => {
  return (
    <div className="message assistant-message thinking-indicator">
      <div className="avatar">🤖</div>
      <div className="content">
        Thinking<span className="dots">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;