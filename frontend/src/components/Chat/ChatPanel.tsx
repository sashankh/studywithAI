import React, { useRef, useEffect, ReactNode } from 'react';
import { Message } from '../../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ThinkingIndicator from './ThinkingIndicator';
import './ChatPanel.css';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  renderMCQ?: (message: Message) => ReactNode;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  renderMCQ 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change or when loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h2>Welcome to AI Chat!</h2>
            <p>Ask me any question or request MCQs on a topic.</p>
            <p className="example">Example: "Generate 5 MCQs on JavaScript Promises"</p>
          </div>
        ) : (
          <>
            {/* Render all messages */}
            {messages.map((message) => (
              <div key={message.id}>
                <ChatMessage message={message} />
                {/* Render MCQ component if this message has MCQ data and we have a renderer */}
                {renderMCQ && renderMCQ(message)}
              </div>
            ))}
            
            {/* Show thinking indicator when loading */}
            {isLoading && <ThinkingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatPanel;