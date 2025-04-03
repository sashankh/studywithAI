import React, { useState } from 'react';
import { Box, Button, Stack, Text, Paper } from '@mantine/core';
import MCQQuestion from './MCQQuestion';
import { MCQQuestion as MCQQuestionType } from '../types/chat';
import { useChat } from '../context/ChatContext';

interface MCQDisplayProps {
  questions: MCQQuestionType[];
  messageId: string;
}

const MCQDisplay: React.FC<MCQDisplayProps> = ({ questions, messageId }) => {
  const { submitMCQAnswers, isLoading } = useChat();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleSubmit = () => {
    // Check if all questions are answered
    const allAnswered = questions.every(q => answers[q.question]);
    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Convert answers to array format for submission
    const answersArray = Object.values(answers);
    
    // Submit answers
    submitMCQAnswers(messageId, answersArray);
  };

  return (
    <Paper p="lg" radius="md" style={{ backgroundColor: '#f7f7f8' }}>
      <Text size="lg" fw={600} mb="md">Please answer the following questions:</Text>
      
      <Stack gap="xl" mb="xl">
        {questions.map((question, index) => (
          <MCQQuestion
            key={index}
            question={question}
            number={index + 1}
            selectedAnswer={answers[question.question] || ''}
            onAnswerSelect={(answerId) => handleAnswerSelect(question.question, answerId)}
          />
        ))}
      </Stack>
      
      <Box ta="center" mt="xl">
        <Button 
          size="lg" 
          color="blue" 
          onClick={handleSubmit}
          loading={isLoading}
          disabled={questions.length !== Object.keys(answers).length}
        >
          Submit Answers
        </Button>
      </Box>
    </Paper>
  );
};

export default MCQDisplay;