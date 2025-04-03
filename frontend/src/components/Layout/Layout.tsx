import React from 'react';
import './Layout.css';

interface LayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, main }) => {
  return (
    <div className="layout">
      <header className="app-header">
        <div className="title-container">
          <h1 className="app-title">StudyBuddy</h1>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link">Login</a>
          <a href="#" className="nav-link sign-up">Sign Up</a>
        </div>
      </header>
      <div className="content-wrapper">
        <div className="sidebar">{sidebar}</div>
        <div className="main-content">{main}</div>
      </div>
    </div>
  );
};

export default Layout;