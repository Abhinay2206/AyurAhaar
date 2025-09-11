import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, typography, spacing, borderRadius } from '../../theme';

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('dashboard');

  const sidebarStyles = {
    width: '240px',
    height: '100vh',
    backgroundColor: colors.secondary.white,
    borderRight: `1px solid ${colors.secondary.warmGray}`,
    position: 'fixed',
    top: '64px', // Height of navbar
    left: 0,
    zIndex: 999,
    padding: `${spacing.lg} 0`,
    overflowY: 'auto',
  };

  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', path: '/app/dashboard' },
    { id: 'patients', icon: '👥', label: 'Patients', path: '/app/patients' },
    { id: 'appointments', icon: '📅', label: 'Appointments', path: '/app/appointments' },
    { id: 'meal-plans', icon: '🍽️', label: 'Meal Plans', path: '/app/meal-plans' },
    { id: 'analytics', icon: '📊', label: 'Analytics', path: '/app/analytics' },
    { id: 'messages', icon: '💬', label: 'Messages', path: '/app/messages' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '/app/settings' },
  ];

  const menuItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.lg}`,
    margin: `0 ${spacing.md}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? colors.background.pattern : 'transparent',
    color: isActive ? colors.primary.herbalGreen : colors.secondary.charcoal,
    fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.normal,
    fontSize: typography.fontSize.sm,
    borderLeft: isActive ? `3px solid ${colors.primary.herbalGreen}` : '3px solid transparent',
    ':hover': {
      backgroundColor: colors.background.pattern,
      color: colors.primary.herbalGreen,
    },
  });

  const iconStyles = {
    fontSize: '1.1rem',
    width: '20px',
    textAlign: 'center',
  };

  const sectionHeaderStyles = {
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  const quickStatsStyles = {
    margin: `${spacing.xl} ${spacing.md}`,
    padding: spacing.md,
    backgroundColor: colors.background.pattern,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.secondary.warmGray}`,
  };

  const quickStatsHeaderStyles = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary.charcoal,
    marginBottom: spacing.sm,
  };

  const quickStatItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.secondary.mediumGray,
    marginBottom: spacing.xs,
  };

  const handleMenuClick = (item) => {
    setActiveItem(item.id);
    navigate(item.path);
  };

  return (
    <aside style={sidebarStyles}>
      {/* Main Navigation */}
      <div>
        {menuItems.slice(0, 4).map((item) => (
          <div
            key={item.id}
            style={menuItemStyles(activeItem === item.id)}
            onClick={() => handleMenuClick(item)}
          >
            <span style={iconStyles}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tools Section */}
      <div style={sectionHeaderStyles}>Tools & Reports</div>
      <div>
        {menuItems.slice(4).map((item) => (
          <div
            key={item.id}
            style={menuItemStyles(activeItem === item.id)}
            onClick={() => handleMenuClick(item)}
          >
            <span style={iconStyles}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div style={quickStatsStyles}>
        <div style={quickStatsHeaderStyles}>Today's Summary</div>
        <div style={quickStatItemStyles}>
          <span>Appointments</span>
          <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.primary.herbalGreen }}>8</span>
        </div>
        <div style={quickStatItemStyles}>
          <span>Pending Plans</span>
          <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.ayurveda.turmericYellow }}>3</span>
        </div>
        <div style={quickStatItemStyles}>
          <span>New Messages</span>
          <span style={{ fontWeight: typography.fontWeight.semibold, color: colors.accent.info }}>12</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: typography.fontSize.xs,
          color: colors.secondary.mediumGray,
          lineHeight: 1.4,
        }}>
          Ayurahaar v2.1<br />
          Healthcare Management
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
