import React, { useState } from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error,
  success,
  icon,
  showPasswordToggle = false,
  disabled = false,
  size = 'medium',

  required = false,
  helperText,
  className = '',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const getSizeStyles = () => {
    const styles = {
      small: {
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        minHeight: '2.25rem',
      },
      medium: {
        padding: '0.75rem 1rem',
        fontSize: '0.9375rem',
        minHeight: '2.75rem',
      },
      large: {
        padding: '1rem 1.25rem',
        fontSize: '1rem',
        minHeight: '3.25rem',
      }
    };
    return styles[size] || styles.medium;
  };

  const containerStyles = {
    marginBottom: '1.5rem',
    position: 'relative',
    fontFamily: 'var(--font-primary)',
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: error ? '#DC3545' : success ? '#3E8E5A' : '#2C5F41', // Section header color
    fontFamily: 'var(--font-primary)',
    transition: 'all 0.3s ease',
    letterSpacing: '0.025em',
  };

  const getInputStyles = () => {
    const baseStyles = {
      width: '100%',
      paddingRight: showPasswordToggle || icon ? '3rem' : '1rem',
      fontFamily: 'var(--font-primary)',
      border: `2px solid ${
        error 
          ? '#DC3545' 
          : success 
            ? '#3E8E5A' // Herbal green
            : isFocused 
              ? '#3E8E5A' // Herbal green focus
              : '#E0E0E0' // Input border
      }`,
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: disabled ? '#F5F7FA' : '#FFFFFF',
      boxSizing: 'border-box',
      boxShadow: isFocused 
        ? error 
          ? '0 0 0 3px rgba(220, 53, 69, 0.1)' 
          : success 
            ? '0 0 0 3px rgba(62, 142, 90, 0.1)' 
            : '0 0 0 3px rgba(62, 142, 90, 0.1)' // Herbal green focus shadow
        : '0 2px 4px rgba(0, 0, 0, 0.05)',
      color: disabled ? '#687076' : '#11181C', // Icon color for disabled, text color for normal
      cursor: disabled ? 'not-allowed' : 'text',
      ...getSizeStyles()
    };

    return baseStyles;
  };

  const iconStyles = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: error ? 'var(--medical-accent)' : success ? 'var(--medical-secondary)' : 'var(--medical-gray-500)',
    pointerEvents: showPasswordToggle ? 'auto' : 'none',
    cursor: showPasswordToggle ? 'pointer' : 'default',
    zIndex: 2,
  };

  const errorStyles = {
    marginTop: '0.375rem',
    fontSize: '0.875rem',
    color: 'var(--medical-accent)',
    fontFamily: 'var(--font-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const successStyles = {
    marginTop: '0.375rem',
    fontSize: '0.875rem',
    color: 'var(--medical-secondary)',
    fontFamily: 'var(--font-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const helperTextStyles = {
    marginTop: '0.375rem',
    fontSize: '0.875rem',
    color: 'var(--medical-gray-600)',
    fontFamily: 'var(--font-primary)',
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div style={containerStyles} className={`medical-input-container ${className}`}>
      {label && (
        <label style={labelStyles} className="medical-input-label">
          {label}
          {required && <span style={{ color: 'var(--medical-accent)', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          style={getInputStyles()}
          className="medical-input"
          {...props}
        />
        
        {(icon || showPasswordToggle) && (
          <div style={iconStyles}>
            {showPasswordToggle && type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: 'inherit',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--medical-gray-100)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>
            ) : icon ? (
              icon
            ) : null}
          </div>
        )}
        
        {/* Focus ring effect */}
        {isFocused && (
          <div style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: 'var(--radius-md)',
            background: error 
              ? 'linear-gradient(45deg, var(--medical-accent), var(--medical-accent-light))' 
              : success 
                ? 'linear-gradient(45deg, var(--medical-secondary), var(--medical-secondary-light))'
                : 'linear-gradient(45deg, var(--medical-primary), var(--medical-primary-light))',
            opacity: 0.1,
            zIndex: -1,
            pointerEvents: 'none',
          }} />
        )}
      </div>
      
      {error && (
        <div style={errorStyles}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {error}
        </div>
      )}
      
      {success && !error && (
        <div style={successStyles}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {success}
        </div>
      )}
      
      {helperText && !error && !success && (
        <div style={helperTextStyles}>
          {helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
