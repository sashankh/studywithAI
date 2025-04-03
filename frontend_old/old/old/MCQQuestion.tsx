import React from 'react';
import { Box, Text, Radio, Group, Stack } from '@mantine/core';
import { MCQ } from '../types/chat';

interface MCQQuestionProps {
  questionNumber: number;
  question: MCQ;
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({
  questionNumber,
  question,
  selectedAnswer,
  onAnswerChange
}) => {
  return (
    <Box>
      <Text fw={500} mb="md">
        {questionNumber}. {question.question}
      </Text>
      
      <Radio.Group 
        value={selectedAnswer} 
        onChange={onAnswerChange}
      >
        <Stack spacing="sm">
          {question.options.map((option, index) => (
            <Radio
              key={index}
              value={option}
              label={option}
              styles={{
                label: {
                  fontSize: '16px',
                }
              }}
            />
          ))}
        </Stack>
      </Radio.Group>
    </Box>
  );
};

export default MCQQuestion;