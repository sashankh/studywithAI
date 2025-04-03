import React from 'react';
import { AppShell } from '@mantine/core';
import ChatPanel from './ChatPanel';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <AppShell
      navbar={{ width: 260, breakpoint: 'sm' }}
      padding={0}
      layout="default"
      styles={{
        main: {
          background: '#ffffff', // White background for the chat panel
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          margin: 0,
        },
        navbar: {
          background: '#f7f7f8', // Light gray background for the sidebar
          borderRight: '1px solid #e5e5e5',
          padding: 0,
          width: '260px',
        }
      }}
    >
      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <ChatPanel />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;