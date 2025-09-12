import React from 'react';

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
  className = '',
  ...props 
}) => {
  const getVariantStyles = () => {
    const styles = {
      primary: {
        background: 'linear-gradient(135deg, var(--medical-primary) 0%, var(--medical-primary-light) 100%)',
        color: 'var(--medical-white)',
        boxShadow: 'var(--medical-shadow-md)',
        border: '1px solid var(--medical-primary)',
      },
      secondary: {
        background: 'var(--medical-white)',
        color: 'var(--medical-primary)',
        border: '2px solid var(--medical-primary)',
        boxShadow: 'var(--medical-shadow-sm)',
      },
      outline: {
        background: 'transparent',
        color: 'var(--medical-gray-600)',
        border: '2px solid var(--medical-gray-300)',
        boxShadow: 'none',
      },
      success: {
        background: 'linear-gradient(135deg, var(--medical-secondary) 0%, var(--medical-secondary-light) 100%)',
        color: 'var(--medical-white)',
        boxShadow: 'var(--medical-shadow-md)',
        border: '1px solid var(--medical-secondary)',
      },
      danger: {
        background: 'linear-gradient(135deg, var(--medical-accent) 0%, var(--medical-accent-light) 100%)',
        color: 'var(--medical-white)',
        boxShadow: 'var(--medical-shadow-md)',
        border: '1px solid var(--medical-accent)',
      },
      warning: {
        background: 'linear-gradient(135deg, var(--medical-warning) 0%, var(--medical-warning-light) 100%)',
        color: 'var(--medical-white)',
        boxShadow: 'var(--medical-shadow-md)',
        border: '1px solid var(--medical-warning)',
      }
    };
    return styles[variant] || styles.primary;
  };

  const getSizeStyles = () => {
    const styles = {
      small: {
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        minHeight: '2.25rem',
      },
      medium: {
        padding: '0.75rem 1.5rem',
        fontSize: '0.9375rem',
        minHeight: '2.75rem',
      },
      large: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        minHeight: '3.25rem',
      }
    };
    return styles[size] || styles.medium;
  };

  const buttonStyles = {
    fontFamily: 'var(--font-primary)',
    fontWeight: '500',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--radius-md)',
    letterSpacing: '0.025em',
    textTransform: 'none',
    gap: '0.5rem',
    ...getVariantStyles(),
    ...getSizeStyles()
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      const button = e.currentTarget;
      if (variant === 'primary' || variant === 'success' || variant === 'danger' || variant === 'warning') {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = 'var(--medical-shadow-lg)';
      } else if (variant === 'secondary') {
        button.style.background = 'var(--medical-primary)';
        button.style.color = 'var(--medical-white)';
      } else if (variant === 'outline') {
        button.style.background = 'var(--medical-gray-50)';
        button.style.borderColor = 'var(--medical-gray-400)';
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      const button = e.currentTarget;
      if (variant === 'primary' || variant === 'success' || variant === 'danger' || variant === 'warning') {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'var(--medical-shadow-md)';
      } else if (variant === 'secondary') {
        button.style.background = 'var(--medical-white)';
        button.style.color = 'var(--medical-primary)';
      } else if (variant === 'outline') {
        button.style.background = 'transparent';
        button.style.borderColor = 'var(--medical-gray-300)';
      }
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={buttonStyles}
      className={`medical-button ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginRight: '0.5rem' }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            strokeOpacity="0.25"
          />
          <path
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      )}
      {icon && !loading && <span style={{ marginRight: '0.25rem' }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
