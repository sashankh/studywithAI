import { useState, useRef, useEffect } from 'react';
import { Box, Container, ScrollArea } from '@mantine/core';
import { useChat } from '../context/ChatContext';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import MCQDisplay from './MCQDisplay';
import MCQEvaluation from './MCQEvaluation';
import WelcomeScreen from './WelcomeScreen';

const ChatBox = () => {
  const { 
    messages, 
    loading, 
    activeMCQ, 
    mcqAnswers,
    mcqEvaluation, 
    sendMessage, 
    handleMCQAnswerChange, 
    submitMCQAnswers,
    startNewChat 
  } = useChat();
  const [showWelcome, setShowWelcome] = useState(messages.length === 0);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (viewport.current) {
      setTimeout(() => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, activeMCQ, showEvaluation]);
  
  // Show evaluation when a new quiz result is available
  useEffect(() => {
    if (mcqEvaluation) {
      setShowEvaluation(true);
    }
  }, [mcqEvaluation]);

  const handleSendMessage = (message: string) => {
    if (showWelcome) {
      setShowWelcome(false);
    }
    if (showEvaluation) {
      setShowEvaluation(false);
    }
    sendMessage(message);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  const handleRetry = () => {
    setShowEvaluation(false);
    startNewChat();
  };

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages area */}
      <ScrollArea 
        style={{ flex: 1 }}
        viewportRef={viewport}
      >
        {showWelcome ? (
          <Container size="md" py="xl">
            <WelcomeScreen 
              onGetStarted={handleGetStarted} 
              onSelectSamplePrompt={handleSendMessage} 
            />
          </Container>
        ) : (
          <Box>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {activeMCQ && (
              <Container size="md" py="md">
                <MCQDisplay 
                  questions={activeMCQ}
                  userAnswers={mcqAnswers}
                  onAnswerChange={handleMCQAnswerChange}
                  onSubmit={submitMCQAnswers}
                />
              </Container>
            )}
            
            {showEvaluation && mcqEvaluation && (
              <Container size="md" py="md">
                <MCQEvaluation 
                  evaluation={mcqEvaluation} 
                  onRetry={handleRetry} 
                />
              </Container>
            )}
          </Box>
        )}
      </ScrollArea>
      
      {/* Input area fixed at the bottom */}
      {!showWelcome && (
        <Box 
          py="md" 
          px="md" 
          style={{ 
            borderTop: '1px solid #e5e5e5',
            backgroundColor: 'white'
          }}
        >
          <Container size="md">
            <MessageInput 
              onSendMessage={handleSendMessage} 
              isLoading={loading}
            />
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default ChatBox;