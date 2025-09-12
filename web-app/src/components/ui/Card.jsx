import React from 'react';

const Card = ({ 
  children, 
  padding = 'medium', 
  variant = 'default',
  hover = true,
  glass = false,
  medical = false,
  className = '',
  ...props 
}) => {
  const getPaddingStyles = () => {
    const styles = {
      small: '1rem',
      medium: '1.5rem',
      large: '2rem',
      xl: '2.5rem'
    };
    return styles[padding] || padding;
  };

  const baseStyles = {
    borderRadius: 'var(--radius-lg)',
    padding: getPaddingStyles(),
    transition: 'all var(--transition-base)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'var(--font-primary)',
  };

  const variants = {
    default: {
      backgroundColor: 'var(--medical-white)',
      boxShadow: 'var(--medical-shadow-md)',
      border: '1px solid var(--medical-gray-200)',
    },
    medical: {
      background: 'linear-gradient(135deg, var(--medical-white) 0%, var(--medical-gray-50) 100%)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--medical-primary-light)',
      boxShadow: 'var(--medical-shadow-lg)',
    },
    elevated: {
      backgroundColor: 'var(--medical-white)',
      boxShadow: 'var(--medical-shadow-xl)',
      border: '1px solid var(--medical-gray-100)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: 'var(--medical-shadow-glass)',
    },
    info: {
      backgroundColor: 'var(--medical-info-light)',
      border: '1px solid var(--medical-info)',
      boxShadow: 'var(--medical-shadow-md)',
    },
    success: {
      backgroundColor: 'var(--medical-secondary-light)',
      border: '1px solid var(--medical-secondary)',
      boxShadow: 'var(--medical-shadow-md)',
    },
    warning: {
      backgroundColor: 'var(--medical-warning-light)',
      border: '1px solid var(--medical-warning)',
      boxShadow: 'var(--medical-shadow-md)',
    },
    danger: {
      backgroundColor: 'var(--medical-accent-light)',
      border: '1px solid var(--medical-accent)',
      boxShadow: 'var(--medical-shadow-md)',
    }
  };

  const cardStyles = {
    ...baseStyles,
    ...variants[glass ? 'glass' : (medical ? 'medical' : variant)],
    ...props.style,
  };

  const handleMouseEnter = (e) => {
    if (hover) {
      const card = e.currentTarget;
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = 'var(--medical-shadow-xl)';
      
      // Add subtle scale effect
      card.style.scale = '1.02';
    }
  };

  const handleMouseLeave = (e) => {
    if (hover) {
      const card = e.currentTarget;
      card.style.transform = 'translateY(0)';
      card.style.scale = '1';
      card.style.boxShadow = variants[glass ? 'glass' : (medical ? 'medical' : variant)].boxShadow;
    }
  };

  return (
    <div 
      style={cardStyles} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`medical-card ${medical ? 'medical-theme' : ''} ${className}`}
      {...props}
    >
      {/* Medical accent border - only for medical variant */}
      {(medical || variant === 'medical') && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--medical-primary), var(--medical-secondary), var(--medical-primary))',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          zIndex: 1,
        }} />
      )}
      
      {/* Success/Info accent border */}
      {variant === 'success' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--medical-secondary)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          zIndex: 1,
        }} />
      )}
      
      {variant === 'warning' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--medical-warning)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          zIndex: 1,
        }} />
      )}
      
      {variant === 'danger' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--medical-accent)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          zIndex: 1,
        }} />
      )}
      
      {/* Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2,
        color: 'var(--medical-gray-800)'
      }}>
        {children}
      </div>
      
      {/* Subtle professional shine effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.03) 50%, transparent 70%)',
        transform: 'rotate(45deg)',
        pointerEvents: 'none',
        opacity: 0.7,
      }} />
    </div>
  );
};

export default Card;
