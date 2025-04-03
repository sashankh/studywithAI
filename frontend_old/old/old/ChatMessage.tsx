import React from 'react';
import { Box, Text, Container, Paper } from '@mantine/core';
import { ChatMessage as ChatMessageType } from '../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, evaluation, isStatusMessage } = message;
  const isUser = role === 'user';
  
  // Status message styling
  if (isStatusMessage) {
    return (
      <Box py="xs" style={{ backgroundColor: isUser ? 'white' : '#f7f7f8' }}>
        <Container size="md">
          <Text size="sm" c="dimmed" fs="italic">
            {content}
          </Text>
        </Container>
      </Box>
    );
  }
  
  // Regular message styling
  return (
    <Box py="md" style={{ backgroundColor: isUser ? 'white' : '#f7f7f8' }}>
      <Container size="md">
        <Text>{content}</Text>
        
        {evaluation && (
          <Paper mt="lg" p="md" radius="md" withBorder>
            <Text fw={700} mb="md">
              Quiz Results: {evaluation.score}/{evaluation.total} ({evaluation.percentage.toFixed(0)}%)
            </Text>
            
            {evaluation.results.map((result, index) => (
              <Box key={index} mb="md" pb="md" style={{ 
                borderBottom: index < evaluation.results.length - 1 ? '1px solid #eaeaea' : 'none'
              }}>
                <Text fw={600} mb="xs">
                  {index + 1}. {result.question}
                </Text>
                
                <Text mb="xs">
                  Your answer: <Text span fw={500} c={result.is_correct ? 'green' : 'red'}>
                    {result.user_answer}
                  </Text>
                  
                  {!result.is_correct && (
                    <Text span ml="md">
                      Correct answer: <Text span fw={500} c="blue">{result.correct_answer}</Text>
                    </Text>
                  )}
                </Text>
                
                {result.explanation && (
                  <Text size="sm" fs="italic" c="dimmed">
                    {result.explanation}
                  </Text>
                )}
              </Box>
            ))}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default ChatMessage;