import React, { useState } from 'react';
import { TextInput, ActionIcon, Loader } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <TextInput
      placeholder="Type your message..."
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={isLoading}
      style={{ width: '100%' }}
      rightSection={
        isLoading ? (
          <Loader size="xs" />
        ) : (
          <ActionIcon 
            color="blue" 
            onClick={handleSend} 
            disabled={!message.trim() || isLoading}
            radius="xl"
          >
            <IconSend size={18} />
          </ActionIcon>
        )
      }
      styles={{
        input: {
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '16px',
          border: '1px solid #ddd',
        }
      }}
    />
  );
};

export default MessageInput;