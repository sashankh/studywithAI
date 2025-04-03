import { Box, Container, Title, Group, useMantineTheme } from '@mantine/core';
import ChatBox from './ChatBox';

export default function Layout() {
  const theme = useMantineTheme();

  return (
    <Box style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f7f7f8'
    }}>
      {/* Header */}
      <Box 
        py="md" 
        style={{ 
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: 'white'
        }}
      >
        <Container>
          <Group position="center">
            <Title order={3} fw={600}>
              <span style={{ color: '#228BE6' }}>MCQ</span> Generator
            </Title>
          </Group>
        </Container>
      </Box>

      {/* Main content area */}
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <ChatBox />
      </Box>
    </Box>
  );
}