import React, { useState } from 'react';
import { colors, typography, spacing, borderRadius, shadows, animations } from '../../theme';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  icon,
  showPasswordToggle = false,
  disabled = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const containerStyles = {
    marginBottom: spacing.md,
    position: 'relative',
  };

  const labelStyles = {
    display: 'block',
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    color: colors.secondary.charcoal,
    fontFamily: typography.fontFamily.primary,
    transition: animations.transition.normal,
  };

  const inputStyles = {
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    paddingRight: showPasswordToggle || icon ? '3rem' : spacing.md,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.primary,
    border: `1px solid ${error ? colors.accent.error : isFocused ? colors.primary.herbalGreen : colors.secondary.mediumGray}`,
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: animations.transition.spring,
    backgroundColor: disabled ? colors.secondary.warmGray : colors.secondary.white,
    boxSizing: 'border-box',
    boxShadow: isFocused ? shadows.medical : 'none',
    color: colors.secondary.charcoal,
    '::placeholder': {
      color: colors.secondary.mediumGray,
    }
  };

  const focusedInputStyles = {
    ...inputStyles,
    transform: 'translateY(-2px)',
    boxShadow: `${shadows.md}, ${shadows.glow}`,
  };

  const iconContainerStyles = {
    position: 'absolute',
    right: spacing.md,
    top: label ? '2.8rem' : '50%',
    transform: label ? 'translateY(0)' : 'translateY(-50%)',
    cursor: showPasswordToggle ? 'pointer' : 'default',
    color: isFocused ? colors.primary.herbalGreen : colors.secondary.mediumGray,
    display: 'flex',
    alignItems: 'center',
    fontSize: typography.fontSize.lg,
    transition: animations.transition.normal,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  };

  const errorStyles = {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.accent.error,
    fontFamily: typography.fontFamily.primary,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
  };

  const floatingLabelStyles = {
    position: 'absolute',
    left: spacing.lg,
    top: isFocused || value ? spacing.xs : '50%',
    transform: isFocused || value ? 'translateY(0) scale(0.85)' : 'translateY(-50%)',
    transformOrigin: 'left',
    fontSize: isFocused || value ? typography.fontSize.xs : typography.fontSize.base,
    color: isFocused ? colors.primary.herbalGreen : colors.secondary.mediumGray,
    transition: animations.transition.spring,
    pointerEvents: 'none',
    backgroundColor: colors.secondary.white,
    padding: `0 ${spacing.xs}`,
    fontWeight: typography.fontWeight.medium,
  };

  const handleIconClick = () => {
    if (showPasswordToggle) {
      setShowPassword(!showPassword);
    }
  };

  return (
    <div style={containerStyles}>
      {label && !props.floating && <label style={labelStyles}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          placeholder={props.floating ? '' : placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={isFocused ? focusedInputStyles : inputStyles}
          disabled={disabled}
          {...props}
        />
        
        {props.floating && (
          <label style={floatingLabelStyles}>
            {label}
          </label>
        )}
        
        {(showPasswordToggle || icon) && (
          <div 
            style={iconContainerStyles}
            onClick={handleIconClick}
          >
            {showPasswordToggle ? (
              <span style={{ 
                fontSize: '1.2rem',
                transition: animations.transition.normal,
                transform: showPassword ? 'scale(1.1)' : 'scale(1)',
              }}>
                {showPassword ? '👁️' : '🙈'}
              </span>
            ) : (
              <span style={{ 
                fontSize: '1.1rem',
                opacity: isFocused ? 1 : 0.7,
                transition: animations.transition.normal,
              }}>
                {icon}
              </span>
            )}
          </div>
        )}
      </div>
      {error && (
        <div style={errorStyles}>
          <span>⚠️</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
