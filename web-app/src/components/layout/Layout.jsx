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
    marginLeft: sidebarCollapsed ? '60px' : '240px', // Updated to match new sidebar widths
    marginTop: '60px', // Updated to match new navbar height
    flex: 1,
    padding: 0,
    minHeight: 'calc(100vh - 60px)', // Updated to match new navbar height
    transition: 'margin-left var(--transition-base)',
    background: 'var(--bg-gradient-primary)',
    position: 'relative',
  };

  const contentWrapperStyles = {
    padding: '1rem', // Reduced from var(--space-6) for minimal spacing
    maxWidth: '100%',
    margin: '0 auto',
  };

  // Responsive styles
  const responsiveStyles = `
    @media (max-width: 1024px) {
      .main-content {
        margin-left: ${sidebarCollapsed ? '0' : '240px'} !important; /* Updated to match new sidebar width */
      }
    }
    
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0 !important;
        margin-top: 60px !important; /* Updated to match new navbar height */
        padding: 0.75rem !important; /* Reduced for minimal spacing */
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
