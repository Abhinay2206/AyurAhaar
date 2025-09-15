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
    const user = AuthService.getUser();
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
    width: collapsed ? '60px' : '240px',
    height: '100vh',
    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
    borderRight: '1px solid #E0E0E0',
    position: 'fixed',
    top: '60px',
    left: 0,
    zIndex: 40,
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'width 0.3s ease',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.05)',
  };

  const headerStyles = {
    padding: collapsed ? '0.75rem 0.5rem' : '1rem 1rem',
    borderBottom: '1px solid #E0E0E0',
    marginBottom: '0.75rem',
    background: 'linear-gradient(135deg, #E8F5E8 0%, #FDF4E8 100%)',
  };

  const hospitalInfoStyles = {
    display: collapsed ? 'none' : 'block',
    textAlign: 'left',
  };

  const hospitalNameStyles = {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#2C5F41',
    marginBottom: '0.25rem',
    letterSpacing: '0.02em',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const departmentStyles = {
    fontSize: '0.75rem',
    color: '#687076',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  // Role-based menu items
  const getMenuItems = () => {
    if (userRole === 'super-admin') {
      return [
        { 
          id: 'dashboard', 
          icon: '■', 
          label: 'Dashboard', 
          path: '/super-admin/dashboard',
          category: 'main'
        },
        { 
          id: 'doctors', 
          icon: '⚕', 
          label: 'Doctor Management', 
          path: '/super-admin/doctors',
          category: 'main'
        },
        { 
          id: 'patients', 
          icon: '●', 
          label: 'Patient Analytics', 
          path: '/super-admin/patients',
          category: 'main'
        },
        { 
          id: 'food-database', 
          icon: '■', 
          label: 'Food Database', 
          path: '/super-admin/food-database',
          category: 'management'
        },
        { 
          id: 'meal-plans', 
          icon: '◉', 
          label: 'Meal Plans', 
          path: '/super-admin/meal-plans',
          category: 'management'
        },
        { 
          id: 'revenue', 
          icon: '▲', 
          label: 'Revenue Analytics', 
          path: '/super-admin/revenue',
          category: 'analytics'
        },
        { 
          id: 'system-health', 
          icon: '⚙', 
          label: 'System Health', 
          path: '/super-admin/system-health',
          category: 'analytics'
        },
        { 
          id: 'reports', 
          icon: '■', 
          label: 'Reports', 
          path: '/super-admin/reports',
          category: 'analytics'
        },
        { 
          id: 'settings', 
          icon: '⚙', 
          label: 'System Settings', 
          path: '/super-admin/settings',
          category: 'system'
        },
      ];
    } else {
      // Regular admin/doctor menu items
      return [
        { 
          id: 'dashboard', 
          icon: '■', 
          label: 'Dashboard', 
          path: '/app/dashboard',
          category: 'main'
        },
        { 
          id: 'patients', 
          icon: '●', 
          label: 'Patient Registry', 
          path: '/app/patients',
          category: 'main'
        },
        { 
          id: 'consultations', 
          icon: '⚕', 
          label: 'Consultations', 
          path: '/app/consultations',
          category: 'main'
        },
        { 
          id: 'meal-plans', 
          icon: '◉', 
          label: 'Treatment Plans', 
          path: '/app/treatment-plans',
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
          id: 'analytics', 
          icon: '▲', 
          label: 'Analytics', 
          path: '/app/analytics',
          category: 'insights'
        },
        { 
          id: 'messages', 
          icon: '●', 
          label: 'Messages', 
          path: '/app/messages',
          category: 'communication'
        },
        { 
          id: 'settings', 
          icon: '⚙', 
          label: 'Settings', 
          path: '/app/settings',
          category: 'system'
        },
      ];
    }
  };

  const menuItems = getMenuItems();

  const menuItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? '0' : '0.5rem',
    padding: collapsed ? '0.5rem' : '0.5rem 0.75rem',
    margin: `0 0.5rem 0.25rem 0.5rem`,
    borderRadius: '8px',
    color: isActive ? '#2C5F41' : '#687076',
    backgroundColor: isActive ? '#E8F5E8' : 'transparent',
    border: isActive ? '1px solid #3E8E5A' : '1px solid transparent',
    borderBottom: '1px solid #E0E0E0',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem',
    fontWeight: isActive ? '600' : '500',
    textDecoration: 'none',
    justifyContent: collapsed ? 'center' : 'flex-start',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
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

  const collapseBtnStyles = {
    position: 'absolute',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#3E8E5A',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  };

  const getDisplayTitle = () => {
    if (userRole === 'super-admin') {
      return 'AyurAhaar System';
    } else {
      return 'AyurAhaar Clinic';
    }
  };

  const getDisplaySubtitle = () => {
    if (userRole === 'super-admin') {
      return 'Administration Portal';
    } else {
      return 'Ayurvedic Medicine';
    }
  };

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  const handleItemHover = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = 'rgba(62, 142, 90, 0.05)';
      e.target.style.color = '#3E8E5A';
      e.target.style.transform = 'translateX(4px)';
    }
  };

  const handleItemLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.color = '#687076';
      e.target.style.transform = 'translateX(0)';
    }
  };

  const handleCollapseHover = (e) => {
    e.target.style.backgroundColor = '#E8F5E8';
    e.target.style.transform = 'translateX(-50%) translateY(-2px)';
    e.target.style.boxShadow = '0 6px 20px rgba(62, 142, 90, 0.2)';
  };

  const handleCollapseLeave = (e) => {
    e.target.style.backgroundColor = '#FFFFFF';
    e.target.style.transform = 'translateX(-50%) translateY(0)';
    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
  };

  return (
    <aside style={sidebarStyles}>
      <div style={headerStyles}>
        {!collapsed && (
          <div style={hospitalInfoStyles}>
            <div style={hospitalNameStyles}>{getDisplayTitle()}</div>
            <div style={departmentStyles}>{getDisplaySubtitle()}</div>
          </div>
        )}
        {collapsed && (
          <div style={{ textAlign: 'center', fontSize: '20px' }}>
            {userRole === 'super-admin' ? '⚡' : '⚕'}
          </div>
        )}
      </div>

      <nav>
        {menuItems.map(item => {
          const isActive = activeItem === item.id;
          return (
            <div
              key={item.id}
              style={menuItemStyles(isActive)}
              onClick={() => handleItemClick(item)}
              onMouseEnter={(e) => handleItemHover(e, isActive)}
              onMouseLeave={(e) => handleItemLeave(e, isActive)}
            >
              <span style={iconStyles}>{item.icon}</span>
              <span style={labelStyles}>{item.label}</span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  backgroundColor: '#3E8E5A',
                  borderRadius: '0 4px 4px 0',
                }} />
              )}
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