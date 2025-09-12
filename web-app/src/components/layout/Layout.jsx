import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const layoutStyles = {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-gradient-primary)',
    fontFamily: 'var(--font-primary)',
  };

  const mainContentStyles = {
    marginLeft: sidebarCollapsed ? '80px' : '280px',
    marginTop: '80px',
    flex: 1,
    padding: 0,
    minHeight: 'calc(100vh - 80px)',
    transition: 'margin-left var(--transition-base)',
    background: 'var(--bg-gradient-primary)',
    position: 'relative',
  };

  const contentWrapperStyles = {
    padding: 'var(--space-6)',
    maxWidth: '100%',
    margin: '0 auto',
  };

  // Responsive styles
  const responsiveStyles = `
    @media (max-width: 1024px) {
      .main-content {
        margin-left: ${sidebarCollapsed ? '0' : '280px'} !important;
      }
    }
    
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0 !important;
        margin-top: 70px !important;
        padding: var(--space-4) !important;
      }
    }
  `;

  return (
    <div style={layoutStyles}>
      <style>{responsiveStyles}</style>
      <Navbar 
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <Sidebar 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main style={mainContentStyles} className="main-content">
        <div style={contentWrapperStyles}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
