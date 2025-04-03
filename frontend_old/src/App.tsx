import { MantineProvider } from '@mantine/core';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/Layout';
import './assets/styles/App.css';

function App() {
  return (
    <MantineProvider 
      theme={{ 
        fontFamily: 'Poppins, sans-serif',
        headings: { fontFamily: 'Poppins, sans-serif' },
        primaryColor: 'blue',
      }} 
    >
      <ChatProvider>
        <Layout />
      </ChatProvider>
    </MantineProvider>
  );
}

export default App;