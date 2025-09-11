import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { colors } from '../../theme';

const Layout = () => {
  const layoutStyles = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: colors.secondary.lightCream,
  };

  const mainContentStyles = {
    marginLeft: '240px', // Width of sidebar
    marginTop: '64px', // Height of navbar
    flex: 1,
    padding: 0,
    minHeight: 'calc(100vh - 64px)',
  };

  return (
    <div style={layoutStyles}>
      <Navbar />
      <Sidebar />
      <main style={mainContentStyles}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
