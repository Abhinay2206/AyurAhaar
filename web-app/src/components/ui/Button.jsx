import React from 'react';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../theme';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  disabled = false,
  onClick,
  type = 'button',
  icon,
  loading = false,
  ...props 
}) => {
  const baseStyles = {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.normal,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: animations.transition.spring,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    transform: disabled ? 'none' : 'translateY(0)',
  };

  const variants = {
    primary: {
      background: colors.gradient.primary,
      color: colors.secondary.white,
      boxShadow: `${shadows.md}, 0 0 0 rgba(45, 122, 50, 0.3)`,
      ':hover': {
        boxShadow: `${shadows.lg}, ${shadows.medical}`,
        transform: 'translateY(-1px)',
      }
    },
    secondary: {
      background: colors.gradient.card,
      color: colors.primary.herbalGreen,
      border: `2px solid ${colors.primary.herbalGreen}`,
      boxShadow: shadows.sm,
      ':hover': {
        background: colors.primary.herbalGreen,
        color: colors.secondary.white,
        transform: 'translateY(-1px)',
      }
    },
    google: {
      background: colors.secondary.white,
      color: colors.secondary.charcoal,
      border: `1px solid ${colors.secondary.mediumGray}`,
      boxShadow: shadows.professional,
      ':hover': {
        boxShadow: shadows.lg,
        transform: 'translateY(-1px)',
      }
    },
    medical: {
      background: colors.background.professional,
      backdropFilter: 'blur(8px)',
      color: colors.primary.medicalBlue,
      border: `1px solid rgba(25, 118, 210, 0.2)`,
      boxShadow: shadows.medical,
      ':hover': {
        background: 'rgba(255, 255, 255, 0.95)',
        transform: 'translateY(-1px)',
      }
    },
  };

  const sizes = {
    small: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.fontSize.xs,
      borderRadius: borderRadius.sm,
      gap: spacing.xs,
    },
    medium: {
      padding: `${spacing.sm} ${spacing.lg}`,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    large: {
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize.base,
      borderRadius: borderRadius.lg,
      gap: spacing.sm,
    },
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = variant === 'primary' ? 
        `${shadows.lg}, ${shadows.glow}` : shadows.lg;
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = variants[variant].boxShadow || shadows.md;
    }
  };

  return (
    <button 
      type={type}
      style={buttonStyles} 
      onClick={onClick} 
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Shimmer effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        transition: 'left 0.5s',
        pointerEvents: 'none',
      }} />
      
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTop: `2px solid ${variant === 'primary' ? colors.secondary.white : colors.primary.herbalGreen}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: spacing.sm,
        }} />
      )}
      
      {icon && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      
      {children}
    </button>
  );
};

export default Button;
