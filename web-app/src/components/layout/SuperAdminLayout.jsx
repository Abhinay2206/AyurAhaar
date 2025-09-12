import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/super-admin/dashboard'
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: '👨‍⚕️',
      path: '/super-admin/doctors'
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: '👥',
      path: '/super-admin/patients'
    },
    {
      id: 'food-database',
      label: 'Food Database',
      icon: '🥗',
      path: '/super-admin/food-database'
    },
    {
      id: 'meal-plans',
      label: 'Meal Plans',
      icon: '📋',
      path: '/super-admin/meal-plans'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      path: '/super-admin/analytics'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      path: '/super-admin/settings'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/super-admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="super-admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <span className="logo-icon">🏛️</span>
            <div className="logo-text">
              <h2>AyurAhaar</h2>
              <p>Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="admin-navigation">
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="profile-avatar">SA</div>
            <div className="profile-info">
              <p className="profile-name">Super Admin</p>
              <p className="profile-email">admin@ayurahaar.com</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>Super Admin Portal</h1>
            <p>Complete system management and oversight</p>
          </div>
          <div className="header-right">
            <div className="system-status">
              <span className="status-indicator healthy"></span>
              <span>System Healthy</span>
            </div>
            <div className="current-time">
              {new Date().toLocaleString()}
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
