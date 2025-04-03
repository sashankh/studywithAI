import React from 'react';
import { Paper, Title, Text, Button, SimpleGrid } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSelectSamplePrompt: (prompt: string) => void;
}

const samplePrompts = [
  "Explain the concept of neural networks and generate practice questions",
  "Create MCQs about the solar system for a 10th grade student",
  "Help me understand photosynthesis with some practice questions"
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onSelectSamplePrompt }) => {
  return (
    <Paper radius="md" p="xl" withBorder style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title order={2} ta="center" mb="md">
        Welcome to <span style={{ color: '#228BE6' }}>MCQ</span> Generator
      </Title>
      
      <Text c="dimmed" ta="center" mb="xl">
        Ask questions on any topic and generate multiple-choice quizzes to test your knowledge
      </Text>

      <Text fw={500} mb="md">Try these example prompts:</Text>
      
      <SimpleGrid cols={1} spacing="sm" mb="xl">
        {samplePrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="light"
            color="blue"
            fullWidth
            onClick={() => onSelectSamplePrompt(prompt)}
            styles={{
              root: {
                justifyContent: 'flex-start',
                height: 'auto',
                padding: '10px 15px',
                textAlign: 'left'
              },
              label: {
                whiteSpace: 'normal'
              }
            }}
          >
            {prompt}
          </Button>
        ))}
      </SimpleGrid>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          rightSection={<IconArrowRight />}
          onClick={onGetStarted}
        >
          Start a new conversation
        </Button>
      </div>
    </Paper>
  );
};

export default WelcomeScreen;