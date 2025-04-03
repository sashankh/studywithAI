import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import MCQQuestion from './MCQQuestion';
import MCQSubmit from './MCQSubmit';
import '../assets/styles/Chat.css';
import { ChatMessage as ChatMessageType, MCQQuestion as MCQQuestionType } from '../types/chat';

const ChatResponse: React.FC = () => {
  const { messages, loading, activeMCQ } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMCQ]);

  return (
    <div className="chat-response">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <div className="empty-chat-message">
            <h2>Welcome to the Chat MCQ App</h2>
            <p>Start a conversation or ask for MCQs on a topic.</p>
            <p>Example: "Ask back some MCQs on a topic JavaScript"</p>
          </div>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((message: ChatMessageType) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {loading && (
            <div className="chat-message assistant loading">
              <div className="chat-message-avatar">🤖</div>
              <div className="chat-message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          {activeMCQ && (
            <div className="chat-message assistant">
              <div className="chat-message-avatar">🤖</div>
              <div className="chat-message-content">
                <div className="chat-message-text">
                  <h3>Please answer the following questions:</h3>
                  {activeMCQ.map((question: MCQQuestionType, index: number) => (
                    <MCQQuestion
                      key={index}
                      question={question}
                      index={index}
                    />
                  ))}
                  <MCQSubmit />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatResponse;