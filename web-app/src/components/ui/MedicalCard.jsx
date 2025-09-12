import React from 'react';
import { colors, typography, spacing, borderRadius } from '../../theme';

const MedicalCard = ({ 
  children, 
  title, 
  subtitle, 
  action, 
  hoverable = true, 
  padding = 'default',
  className = '',
  ...props 
}) => {
  const cardStyles = {
    backgroundColor: colors.background.surface,
    border: `1px solid ${colors.medical.border}`,
    borderRadius: borderRadius.lg,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    ...props.style,
  };

  const headerStyles = {
    padding: spacing.lg,
    borderBottom: title ? `1px solid ${colors.medical.border}` : 'none',
    backgroundColor: colors.secondary.lightGray,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyles = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.medical.text.primary,
    margin: 0,
  };

  const subtitleStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.medical.text.secondary,
    margin: 0,
    marginTop: '2px',
  };

  const contentStyles = {
    padding: padding === 'none' ? 0 : 
             padding === 'small' ? spacing.md : 
             padding === 'large' ? spacing.xl : 
             spacing.lg,
  };

  const handleMouseEnter = (e) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }
  };

  const handleMouseLeave = (e) => {
    if (hoverable) {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <div
      className={`medical-card ${className}`}
      style={cardStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {(title || subtitle || action) && (
        <div style={headerStyles}>
          <div>
            {title && <h3 style={titleStyles}>{title}</h3>}
            {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={contentStyles}>
        {children}
      </div>
    </div>
  );
};

export default MedicalCard;
