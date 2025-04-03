import React, { useEffect, useRef } from 'react';
import { Box, Stack, Flex, Text } from '@mantine/core';
import MessageInput from './MessageInput';
import ChatMessage from './ChatMessage';
import MCQDisplay from './MCQDisplay';
import { useChat } from '../context/ChatContext';
import { ChatMessage as ChatMessageType } from '../types/chat';

const ChatPanel: React.FC = () => {
  const { activeChat, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Safely handle the case when activeChat is null
  if (!activeChat) {
    return (
      <Flex direction="column" style={{ height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Text size="lg" c="dimmed">Loading chat...</Text>
      </Flex>
    );
  }

  // Check if we have MCQs in the last assistant message
  const lastAssistantMessage = activeChat.messages && activeChat.messages.length > 0
    ? activeChat.messages
        .filter((msg: ChatMessageType) => msg.role === 'assistant')
        .slice(-1)[0]
    : undefined;
  
  // Safely check for MCQs, handling potential undefined values
  const hasMCQ = lastAssistantMessage && 
                 lastAssistantMessage.mcq && 
                 lastAssistantMessage.mcq.length > 0 && 
                 !lastAssistantMessage.evaluation;

  return (
    <Flex direction="column" style={{ height: '100vh', backgroundColor: '#ffffff' }}>
      {/* Chat messages area */}
      <Box style={{ 
        flex: 1, 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {!activeChat.messages || activeChat.messages.length === 0 ? (
          <Flex 
            direction="column" 
            justify="center" 
            align="center" 
            style={{ 
              flex: 1,
              height: 'calc(100vh - 120px)', // Ensure it takes full height minus input area
              color: '#6e6e80',
            }}
          >
            <Text align="center" size="lg" fw={500} mb={8}>ChatMCQ</Text>
            <Text align="center" size="md" maw={500} mx="auto">
              Start a conversation by typing a message below.
            </Text>
          </Flex>
        ) : (
          <Stack spacing={0} style={{ minHeight: 'calc(100vh - 120px)' }}>
            {activeChat.messages.map((message: ChatMessageType, index: number) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Box>

      {/* MCQ display or message input - Fixed at bottom */}
      <Box 
        style={{ 
          borderTop: '1px solid #e5e5e5', 
          backgroundColor: '#ffffff',
          padding: '16px 0',
          width: '100%',
          position: 'sticky',
          bottom: 0,
        }}
      >
        <Box px="md" style={{ maxWidth: '768px', margin: '0 auto' }}>
          {hasMCQ && lastAssistantMessage ? (
            <MCQDisplay
              questions={lastAssistantMessage.mcq!}
              messageId={lastAssistantMessage.id}
            />
          ) : (
            <MessageInput 
              onSendMessage={sendMessage} 
              isLoading={isLoading} 
            />
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default ChatPanel;