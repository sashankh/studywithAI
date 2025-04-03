import React from 'react';
import { Box, Button, Stack, Text, ScrollArea } from '@mantine/core';
import { IconPlus, IconMessage } from '@tabler/icons-react';
import { useChat } from '../context/ChatContext';

interface Chat {
  id: string;
  title: string;
}

const Sidebar: React.FC = () => {
  const { chatHistory, activeChatId, startNewChat, setActiveChatId } = useChat();

  return (
    <Box style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between', // Distribute content
      padding: '16px',
      backgroundColor: '#f7f7f8', // Light gray background like ChatGPT
    }}>
      {/* New Chat button */}
      <Button 
        leftSection={<IconPlus size={16} />}
        mb="lg"
        onClick={startNewChat}
        variant="default"
        size="md"
        style={{ 
          borderRadius: '6px',
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          color: '#202123'
        }}
      >
        New chat
      </Button>

      {/* Chat history */}
      <ScrollArea style={{ flex: 1 }} scrollbarSize={6}>
        <Stack gap="sm">
          {chatHistory.map((chat: Chat) => (
            <Button
              key={chat.id}
              variant="subtle"
              color="gray"
              onClick={() => setActiveChatId(chat.id)}
              leftSection={<IconMessage size={16} opacity={0.6} />}
              styles={{
                root: {
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  height: 'auto',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  width: '100%',
                  fontWeight: 'normal',
                  backgroundColor: activeChatId === chat.id ? '#e6e6e6' : 'transparent',
                  borderLeft: activeChatId === chat.id ? '3px solid #10a37f' : '0',
                  paddingLeft: activeChatId === chat.id ? '9px' : '12px', // Compensate for border
                  '&:hover': {
                    backgroundColor: activeChatId === chat.id ? '#e6e6e6' : '#ececf1',
                  }
                },
                label: {
                  fontSize: '14px',
                  color: '#202123'
                }
              }}
            >
              <Text lineClamp={1} size="sm">
                {chat.title || "New Conversation"}
              </Text>
            </Button>
          ))}
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default Sidebar;