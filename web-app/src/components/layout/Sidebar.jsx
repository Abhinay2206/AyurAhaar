import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');

  const sidebarStyles = {
    width: collapsed ? '80px' : '280px',
    height: '100vh',
    background: 'var(--bg-gradient-sidebar)',
    borderRight: '1px solid var(--gray-200)',
    position: 'fixed',
    top: '80px',
    left: 0,
    zIndex: 40,
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'width var(--transition-base)',
    boxShadow: 'var(--shadow-sm)',
  };

  const headerStyles = {
    padding: collapsed ? 'var(--space-4) var(--space-3)' : 'var(--space-6) var(--space-6)',
    borderBottom: '1px solid var(--gray-200)',
    marginBottom: 'var(--space-4)',
    background: 'var(--gray-25)',
  };

  const hospitalInfoStyles = {
    display: collapsed ? 'none' : 'block',
    textAlign: 'left',
  };

  const hospitalNameStyles = {
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-1)',
    letterSpacing: 'var(--tracking-wide)',
  };

  const departmentStyles = {
    fontSize: 'var(--text-xs)',
    color: 'var(--gray-500)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-wider)',
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: '📊', 
      label: 'Dashboard', 
      path: '/app/dashboard',
      category: 'main'
    },
    { 
      id: 'patients', 
      icon: '👥', 
      label: 'Patient Registry', 
      path: '/app/patients',
      category: 'main'
    },
    { 
      id: 'appointments', 
      icon: '📅', 
      label: 'Appointments', 
      path: '/app/appointments',
      category: 'main'
    },
    { 
      id: 'consultations', 
      icon: '🩺', 
      label: 'Consultations', 
      path: '/app/consultations',
      category: 'main'
    },
    { 
      id: 'meal-plans', 
      icon: '🍽️', 
      label: 'Treatment Plans', 
      path: '/app/meal-plans',
      category: 'clinical'
    },
    { 
      id: 'prescriptions', 
      icon: '💊', 
      label: 'Prescriptions', 
      path: '/app/prescriptions',
      category: 'clinical'
    },
    { 
      id: 'reports', 
      icon: '📋', 
      label: 'Medical Reports', 
      path: '/app/reports',
      category: 'clinical'
    },
    { 
      id: 'analytics', 
      icon: '📈', 
      label: 'Analytics', 
      path: '/app/analytics',
      category: 'insights'
    },
    { 
      id: 'messages', 
      icon: '💬', 
      label: 'Messages', 
      path: '/app/messages',
      category: 'communication'
    },
    { 
      id: 'settings', 
      icon: '⚙️', 
      label: 'Settings', 
      path: '/app/settings',
      category: 'system'
    },
  ];

  const categoryLabels = {
    main: 'Main',
    clinical: 'Clinical',
    insights: 'Insights',
    communication: 'Communication',
    system: 'System'
  };

  const getMenuItemsByCategory = (category) => {
    return menuItems.filter(item => item.category === category);
  };

  const categories = ['main', 'clinical', 'insights', 'communication', 'system'];

  const menuItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? '0' : 'var(--space-3)',
    padding: collapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
    margin: `0 var(--space-3) var(--space-2) var(--space-3)`,
    borderRadius: 'var(--radius-xl)',
    color: isActive ? 'var(--primary-700)' : 'var(--gray-600)',
    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
    border: isActive ? '1px solid var(--primary-200)' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    fontSize: 'var(--text-sm)',
    fontWeight: isActive ? '600' : '500',
    textDecoration: 'none',
    justifyContent: collapsed ? 'center' : 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  });

  const iconStyles = {
    fontSize: '18px',
    minWidth: '20px',
    textAlign: 'center',
  };

  const labelStyles = {
    display: collapsed ? 'none' : 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const categoryHeaderStyles = {
    padding: collapsed ? 'var(--space-2) var(--space-3)' : 'var(--space-4) var(--space-4) var(--space-2) var(--space-4)',
    fontSize: 'var(--text-xs)',
    fontWeight: '700',
    color: 'var(--gray-400)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-widest)',
    display: collapsed ? 'none' : 'block',
    borderTop: '1px solid var(--gray-100)',
    marginTop: 'var(--space-4)',
  };

  const collapseBtnStyles = {
    position: 'absolute',
    bottom: 'var(--space-6)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: collapsed ? '44px' : '44px',
    height: '44px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--gray-200)',
    backgroundColor: 'var(--gray-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'var(--gray-600)',
    transition: 'var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
  };

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  const handleItemHover = (e) => {
    if (!e.target.classList.contains('active')) {
      e.target.style.backgroundColor = 'var(--gray-50)';
      e.target.style.borderColor = 'var(--gray-200)';
      e.target.style.transform = 'translateX(2px)';
    }
  };

  const handleItemLeave = (e) => {
    if (!e.target.classList.contains('active')) {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.borderColor = 'transparent';
      e.target.style.transform = 'translateX(0)';
    }
  };

  const handleCollapseHover = (e) => {
    e.target.style.backgroundColor = 'var(--primary-50)';
    e.target.style.borderColor = 'var(--primary-200)';
    e.target.style.color = 'var(--primary-600)';
    e.target.style.transform = 'translateX(-50%) scale(1.05)';
  };

  const handleCollapseLeave = (e) => {
    e.target.style.backgroundColor = 'var(--gray-50)';
    e.target.style.borderColor = 'var(--gray-200)';
    e.target.style.color = 'var(--gray-600)';
    e.target.style.transform = 'translateX(-50%) scale(1)';
  };

  return (
    <aside style={sidebarStyles}>
      <div style={headerStyles}>
        {!collapsed && (
          <div style={hospitalInfoStyles}>
            <div style={hospitalNameStyles}>AyurAhaar Clinic</div>
            <div style={departmentStyles}>Ayurvedic Medicine</div>
          </div>
        )}
        {collapsed && (
          <div style={{ textAlign: 'center', fontSize: '20px' }}>🌿</div>
        )}
      </div>

      <nav>
        {categories.map(category => {
          const categoryItems = getMenuItemsByCategory(category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category}>
              {category !== 'main' && (
                <div style={categoryHeaderStyles}>
                  {categoryLabels[category]}
                </div>
              )}
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  style={menuItemStyles(activeItem === item.id)}
                  className={activeItem === item.id ? 'active' : ''}
                  onClick={() => handleItemClick(item)}
                  onMouseEnter={handleItemHover}
                  onMouseLeave={handleItemLeave}
                >
                  <span style={iconStyles}>{item.icon}</span>
                  <span style={labelStyles}>{item.label}</span>
                  {activeItem === item.id && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      backgroundColor: 'var(--primary-600)',
                      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    }} />
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </nav>

      <button
        style={collapseBtnStyles}
        onClick={() => setCollapsed(!collapsed)}
        onMouseEnter={handleCollapseHover}
        onMouseLeave={handleCollapseLeave}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  );
};

export default Sidebar;
