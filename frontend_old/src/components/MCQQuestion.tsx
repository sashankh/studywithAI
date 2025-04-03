import React from 'react';
import { Box, Text, Radio } from '@mantine/core';
import { MCQQuestion as MCQQuestionType } from '../types/chat';

interface MCQQuestionProps {
  question: MCQQuestionType;
  number: number;
  selectedAnswer: string;
  onAnswerSelect: (answerId: string) => void;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({ 
  question, 
  number, 
  selectedAnswer, 
  onAnswerSelect 
}) => {
  const options = Object.entries(question.options);

  return (
    <Box mb="md">
      <Text fw={500} mb="xs">{number}. {question.question}</Text>
      <Radio.Group
        value={selectedAnswer}
        onChange={onAnswerSelect}
        name={`question-${number}`}
      >
        {options.map(([key, value]) => (
          <Box key={key} style={{ width: '100%' }} mb="xs">
            <Radio
              value={key}
              label={`${key}: ${value}`}
              styles={{ label: { fontSize: '1rem' } }}
            />
          </Box>
        ))}
      </Radio.Group>
    </Box>
  );
};

export default MCQQuestion;