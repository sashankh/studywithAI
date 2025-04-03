import React from 'react';
import { Box, Text, Paper } from '@mantine/core';
import { ChatMessage as ChatMessageType } from '../types/chat';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const showEvaluation = message.role === 'assistant' && message.evaluation;
  
  return (
    <Box
      py="md"
      style={{
        backgroundColor: isUser ? '#ffffff' : '#f7f7f8',
        borderBottom: '1px solid #e5e5e5',
        width: '100%',
      }}
    >
      <Box mx="auto" maw={768} px="md">
        <Box mb={8} style={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            mr={8}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: isUser ? '#10a37f' : '#404040',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            {isUser ? 'U' : 'A'}
          </Box>
          <Text size="sm" fw={500}>
            {isUser ? 'You' : 'Assistant'}
          </Text>
        </Box>
        
        <Paper p={0} style={{ background: 'transparent' }}>
          {message.content && (
            <Box style={{ fontSize: '16px', lineHeight: 1.5, paddingLeft: '32px' }}>
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </Box>
          )}
          
          {showEvaluation && (
            <Box mt="md" p="md" style={{ backgroundColor: '#f0f8ff', borderRadius: '8px', marginLeft: '32px' }}>
              <Text fw={500} mb="xs">Quiz Results:</Text>
              <Text>You scored {message.evaluation?.score} out of {message.evaluation?.total}</Text>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatMessage;