import React from 'react';
import { ChatSession } from '../../types';
import './ChatHistory.css';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession,
  onNewChat
}) => {
  return (
    <div className="chat-history">
      <div className="new-chat-button">
        <button onClick={onNewChat}>New Chat</button>
      </div>
      <div className="chat-sessions">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`chat-session ${session.id === currentSessionId ? 'active' : ''}`}
            onClick={() => onSelectSession(session.id)}
          >
            <div className="chat-session-title">{session.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;