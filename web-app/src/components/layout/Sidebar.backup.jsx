import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/authService';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from AuthService
    const user = AuthService.getCurrentUser();
    if (user) {
      setUserRole(user.role);
    }
  }, []);

  useEffect(() => {
    // Set active item based on current location
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    setActiveItem(lastSegment || 'dashboard');
  }, [location.pathname]);

  const sidebarStyles = {
    width: collapsed ? '60px' : '240px', // Reduced from 80px/280px
    height: '100vh',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
    borderRight: '1px solid #E0E0E0',
    position: 'fixed',
    top: '60px', // Updated to match reduced navbar height
    left: 0,
    zIndex: 40,
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'width 0.3s ease',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.05)',
  };

  const headerStyles = {
    padding: collapsed ? '0.75rem 0.5rem' : '1rem 1rem', // Reduced padding
    borderBottom: '1px solid #E0E0E0',
    marginBottom: '0.75rem', // Reduced from 1rem
    background: 'linear-gradient(135deg, #E8F5E8 0%, #FDF4E8 100%)', // Light green to light orange
  };

  const hospitalInfoStyles = {
    display: collapsed ? 'none' : 'block',
    textAlign: 'left',
  };

  const hospitalNameStyles = {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#2C5F41', // Section header color
    marginBottom: '0.25rem',
    letterSpacing: '0.02em',
  };

  const departmentStyles = {
    fontSize: '0.75rem',
    color: '#687076', // Icon color
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: '■', 
      label: 'Dashboard', 
      path: '/app/dashboard',
      category: 'main'
    },
    { 
      id: 'patients', 
      icon: '�', 
      label: 'Patient Registry', 
      path: '/app/patients',
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
      icon: '�', 
      label: 'Treatment Plans', 
      path: '/app/meal-plans',
      category: 'clinical'
    },
    { 
      id: 'prescriptions', 
      icon: '⚕', 
      label: 'Prescriptions', 
      path: '/app/prescriptions',
      category: 'clinical'
    },
    { 
      id: 'reports', 
      icon: '�', 
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
    gap: collapsed ? '0' : '0.5rem', // Reduced from 0.75rem
    padding: collapsed ? '0.5rem' : '0.5rem 0.75rem', // Reduced padding
    margin: `0 0.5rem 0.25rem 0.5rem`, // Reduced margins
    borderRadius: '8px', // Reduced from 12px
    color: isActive ? '#2C5F41' : '#687076', // Section header for active, icon color for inactive
    backgroundColor: isActive ? 'linear-gradient(135deg, #E8F5E8 0%, #FDF4E8 100%)' : 'transparent',
    border: isActive ? '1px solid #3E8E5A' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem', // Reduced from 0.875rem
    fontWeight: isActive ? '600' : '500',
    textDecoration: 'none',
    justifyContent: collapsed ? 'center' : 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    ':hover': {
      backgroundColor: isActive ? '' : 'rgba(62, 142, 90, 0.05)',
      color: '#3E8E5A',
      transform: 'translateX(4px)',
    }
  });

  const iconStyles = {
    fontSize: '18px',
    minWidth: '20px',
    textAlign: 'center',
    filter: 'grayscale(0.2)',
  };

  const labelStyles = {
    display: collapsed ? 'none' : 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const categoryHeaderStyles = {
    padding: collapsed ? '0.25rem 0.5rem' : '0.75rem 0.75rem 0.25rem 0.75rem', // Reduced padding
    fontSize: '0.7rem', // Reduced from 0.75rem
    fontWeight: '700',
    color: '#687076', // Icon color
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: collapsed ? 'none' : 'block',
    borderTop: '1px solid #E0E0E0',
    marginTop: '0.75rem', // Reduced from 1rem
  };

  const collapseBtnStyles = {
    position: 'absolute',
    bottom: '1rem', // Reduced from 1.5rem
    left: '50%',
    transform: 'translateX(-50%)',
    width: collapsed ? '36px' : '36px', // Reduced from 44px
    height: '36px',
    borderRadius: '50%',
    border: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#3E8E5A', // Herbal green
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    ':hover': {
      backgroundColor: '#E8F5E8',
      transform: 'translateX(-50%) translateY(-2px)',
      boxShadow: '0 6px 20px rgba(62, 142, 90, 0.2)',
    }
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
          <div style={{ textAlign: 'center', fontSize: '20px' }}>⚕</div>
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
