import React from 'react';
import { colors, typography, spacing, borderRadius } from '../../theme';

const StatCard = ({ 
  label, 
  value, 
  change, 
  trend = 'neutral', 
  icon, 
  description,
  className = '',
  ...props 
}) => {
  const cardStyles = {
    backgroundColor: colors.background.surface,
    border: `1px solid ${colors.medical.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    position: 'relative',
    overflow: 'hidden',
    ...props.style,
  };

  const iconContainerStyles = {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: '48px',
    height: '48px',
    borderRadius: borderRadius.lg,
    backgroundColor: trend === 'up' ? 'rgba(76, 175, 80, 0.1)' : 
                     trend === 'down' ? 'rgba(231, 76, 60, 0.1)' : 
                     'rgba(46, 90, 172, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  };

  const labelStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.medical.text.secondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyles = {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.medical.text.primary,
    marginBottom: spacing.xs,
    lineHeight: 1,
  };

  const changeStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: trend === 'up' ? colors.accent.success : 
           trend === 'down' ? colors.accent.error : 
           colors.medical.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  };

  const descriptionStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.medical.text.secondary,
    marginTop: spacing.xs,
  };

  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➖';

  const handleMouseEnter = (e) => {
    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <div
      className={`stat-card ${className}`}
      style={cardStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {icon && (
        <div style={iconContainerStyles}>
          {icon}
        </div>
      )}
      
      <div style={labelStyles}>{label}</div>
      <div style={valueStyles}>{value}</div>
      
      {change && (
        <div style={changeStyles}>
          <span>{trendIcon}</span>
          {change}
        </div>
      )}
      
      {description && (
        <div style={descriptionStyles}>{description}</div>
      )}
    </div>
  );
};

export default StatCard;
