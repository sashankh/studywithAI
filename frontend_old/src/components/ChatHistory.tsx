import React from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { IconPlus, IconMessage } from '@tabler/icons-react';
import { useChat } from '../context/ChatContext';

const ChatHistory: React.FC = () => {
  const { startNewChat } = useChat();
  
  // This is a placeholder since we don't have chat history functionality yet
  // In a real app, this would display past conversations
  const chatHistory = [
    { id: 1, title: 'Neural Networks Conversation' },
    { id: 2, title: 'Solar System MCQs' },
    { id: 3, title: 'Photosynthesis Quiz' },
  ];

  return (
    <Stack gap="md" style={{ height: '100%' }}>
      <Button 
        leftSection={<IconPlus size={16} />}
        onClick={startNewChat}
        fullWidth
        variant="light"
      >
        New Chat
      </Button>
      
      <Text size="sm" fw={500} c="dimmed" mt="md">
        Recent Chats
      </Text>
      
      <Stack gap="xs">
        {chatHistory.map((chat) => (
          <Button
            key={chat.id}
            variant="subtle"
            color="gray"
            fullWidth
            leftSection={<IconMessage size={16} />}
            styles={{
              root: {
                justifyContent: 'flex-start',
                textAlign: 'left'
              }
            }}
          >
            <Text truncate style={{ maxWidth: '180px' }}>
              {chat.title}
            </Text>
          </Button>
        ))}
      </Stack>
    </Stack>
  );
};

export default ChatHistory;