import { useState, useEffect } from 'react';
import { Paper, Title, Text, Progress, Group, Badge, Box, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { MCQEvaluation as MCQEvaluationType } from '../types/chat';

interface MCQEvaluationProps {
  evaluation: MCQEvaluationType;
  onRetry: () => void;
}

export default function MCQEvaluation({ evaluation, onRetry }: MCQEvaluationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (evaluation.percentage >= 70) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [evaluation]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper shadow="md" radius="lg" p="xl" withBorder>
          <Title order={2} mb="md">Quiz Results</Title>
          
          <Group justify="apart" mb="lg">
            <Text size="xl" fw={700}>
              Your Score: {evaluation.score}/{evaluation.total}
            </Text>
            <Badge 
              size="xl" 
              color={getScoreColor(evaluation.percentage)}
              variant="filled"
            >
              {evaluation.percentage.toFixed(1)}%
            </Badge>
          </Group>
          
          <Box mb="xl" style={{ position: 'relative' }}>
            <Progress 
              value={evaluation.percentage} 
              color={getScoreColor(evaluation.percentage)}
              size="xl"
              radius="xl"
              striped
              animated
            />
            <Text ta="center" mt="xs">
              {evaluation.percentage.toFixed(0)}%
            </Text>
          </Box>
          
          <Box mt="lg">
            <Button 
              leftSection={<IconRefresh size={20} />}
              onClick={onRetry}
              variant="outline"
            >
              Try Another Quiz
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </>
  );
}