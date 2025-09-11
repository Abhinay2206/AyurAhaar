import React, { useState } from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

const Navbar = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New patient appointment request', time: '5 min ago' },
    { id: 2, message: 'Meal plan approval pending', time: '15 min ago' },
    { id: 3, message: 'Patient feedback received', time: '1 hour ago' },
  ]);

  const navbarStyles = {
    height: '64px',
    backgroundColor: colors.secondary.white,
    borderBottom: `1px solid ${colors.secondary.warmGray}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${spacing.lg}`,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: shadows.sm,
  };

  const logoSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  };

  const logoStyles = {
    fontSize: '1.5rem',
    color: colors.primary.herbalGreen,
  };

  const titleStyles = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.herbalGreen,
    fontFamily: typography.fontFamily.primary,
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.lg,
  };

  const notificationStyles = {
    position: 'relative',
    cursor: 'pointer',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: colors.secondary.warmGray,
    },
  };

  const notificationBadgeStyles = {
    position: 'absolute',
    top: '6px',
    right: '6px',
    width: '8px',
    height: '8px',
    backgroundColor: colors.accent.error,
    borderRadius: '50%',
  };

  const profileSectionStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    transition: 'background-color 0.2s ease',
  };

  const avatarStyles = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: colors.primary.herbalGreen,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.secondary.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  };

  const doctorInfoStyles = {
    display: 'flex',
    flexDirection: 'column',
  };

  const doctorNameStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary.charcoal,
    lineHeight: 1.2,
  };

  const doctorRoleStyles = {
    fontSize: typography.fontSize.xs,
    color: colors.secondary.mediumGray,
    lineHeight: 1.2,
  };

  const dropdownStyles = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.secondary.white,
    border: `1px solid ${colors.secondary.warmGray}`,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.lg,
    minWidth: '200px',
    zIndex: 1001,
  };

  const dropdownItemStyles = {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
    color: colors.secondary.charcoal,
    cursor: 'pointer',
    borderBottom: `1px solid ${colors.secondary.warmGray}`,
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: colors.secondary.warmGray,
    },
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  return (
    <nav style={navbarStyles}>
      {/* Logo Section */}
      <div style={logoSectionStyles}>
        <span style={logoStyles}>🕉️</span>
        <h1 style={titleStyles}>Ayurahaar Doctor Portal</h1>
      </div>

      {/* Right Section */}
      <div style={rightSectionStyles}>
        {/* Notifications */}
        <div style={notificationStyles}>
          <span style={{ fontSize: '1.2rem', color: colors.secondary.charcoal }}>🔔</span>
          {notifications.length > 0 && <div style={notificationBadgeStyles}></div>}
        </div>

        {/* Profile Section */}
        <div style={profileSectionStyles} onClick={handleProfileClick}>
          <div style={avatarStyles}>DR</div>
          <div style={doctorInfoStyles}>
            <span style={doctorNameStyles}>Dr. Rajesh Kumar</span>
            <span style={doctorRoleStyles}>Ayurvedic Physician</span>
          </div>
          <span style={{ 
            fontSize: '0.8rem', 
            color: colors.secondary.mediumGray,
            transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>▼</span>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div style={dropdownStyles}>
              <div style={dropdownItemStyles}>👤 My Profile</div>
              <div style={dropdownItemStyles}>⚙️ Settings</div>
              <div style={dropdownItemStyles}>📊 Analytics</div>
              <div style={dropdownItemStyles}>❓ Help & Support</div>
              <div style={{
                ...dropdownItemStyles,
                borderBottom: 'none',
                color: colors.accent.error,
                fontWeight: typography.fontWeight.medium,
              }}>🚪 Logout</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
