import React, { useState } from 'react';
import { Textarea, ActionIcon, Box, Text } from '@mantine/core';
import { IconSend, IconLoader2 } from '@tabler/icons-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Box pos="relative" style={{ width: '100%' }}>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message ChatMCQ..."
            autosize
            minRows={1}
            maxRows={5}
            radius="xl"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            styles={{
              root: { 
                width: '100%',
              },
              input: {
                padding: '12px 45px 12px 16px',
                fontSize: '16px',
                lineHeight: '1.5',
                border: '1px solid #e0e0e0',
                boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                borderRadius: '20px',
                backgroundColor: '#ffffff',
                '&:focus': {
                  borderColor: '#10a37f',
                  boxShadow: '0 0 0 2px rgba(16, 163, 127, 0.2)',
                }
              }
            }}
          />
          <ActionIcon 
            pos="absolute" 
            right={12} 
            top="50%" 
            style={{ transform: 'translateY(-50%)' }}
            radius="xl"
            size="md"
            type="submit"
            disabled={!message.trim() || isLoading}
            styles={{
              root: {
                backgroundColor: message.trim() && !isLoading ? "#10a37f" : "transparent",
                color: message.trim() && !isLoading ? "white" : "#a9a9a9",
                '&:hover': {
                  backgroundColor: message.trim() && !isLoading ? "#0e906f" : "transparent",
                }
              }
            }}
          >
            {isLoading ? 
              <IconLoader2 size={18} className="animate-spin" /> : 
              <IconSend size={16} />
            }
          </ActionIcon>
        </Box>
      </form>
      <Text size="xs" c="dimmed" ta="center" mt="xs">
        ChatMCQ can make mistakes. Consider verifying important information.
      </Text>
    </Box>
  );
};

export default MessageInput;