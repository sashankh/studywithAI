import React from 'react';
import './Layout.css';

interface LayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, main }) => {
  return (
    <div className="layout">
      <div className="sidebar">{sidebar}</div>
      <div className="main-content">{main}</div>
    </div>
  );
};

export default Layout;