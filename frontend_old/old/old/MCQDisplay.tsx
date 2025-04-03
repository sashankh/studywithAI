import React from 'react';
import { Paper, Title, Button, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import MCQQuestion from './MCQQuestion';
import { MCQQuestion as MCQQuestionType } from '../../src/types/chat';

interface MCQDisplayProps {
  questions: MCQQuestionType[];
  userAnswers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmit: () => void;
}

const MCQDisplay: React.FC<MCQDisplayProps> = ({
  questions,
  userAnswers,
  onAnswerChange,
  onSubmit
}) => {
  // Calculate how many questions have been answered
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;
  const allAnswered = answeredCount === totalQuestions;

  return (
    <Paper p="md" radius="md" withBorder style={{ maxWidth: '100%' }}>
      <Title order={3} mb="md">Multiple Choice Questions</Title>

      <Stack spacing="xl" mb="xl">
        {questions.map((question, index) => (
          <MCQQuestion
            key={question.id}
            questionNumber={index + 1}
            question={question}
            selectedAnswer={userAnswers[question.id] || ''}
            onAnswerChange={(answer) => onAnswerChange(question.id, answer)}
          />
        ))}
      </Stack>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{answeredCount} of {totalQuestions} answered</span>
        <Button
          leftSection={<IconCheck size={18} />}
          onClick={onSubmit}
          disabled={!allAnswered}
        >
          Submit Answers
        </Button>
      </div>
    </Paper>
  );
};

export default MCQDisplay;