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
      small: '0.5rem', // Reduced from 1rem
      medium: '0.75rem', // Reduced from 1.5rem
      large: '1rem', // Reduced from 2rem
      xl: '1.25rem' // Reduced from 2.5rem
    };
    return styles[padding] || padding;
  };

  const baseStyles = {
    borderRadius: '12px', // Reduced from 16px
    padding: getPaddingStyles(),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'var(--font-primary)',
  };

  const variants = {
    default: {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      border: '1px solid #E0E0E0',
    },
    medical: {
      background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)', // Card background gradient
      backdropFilter: 'blur(16px)',
      border: '1px solid #E0E0E0',
      boxShadow: '0 8px 25px rgba(62, 142, 90, 0.12)', // Herbal green shadow
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
      border: '1px solid #E0E0E0',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(62, 142, 90, 0.1)',
    },
    info: {
      backgroundColor: '#D1ECF1',
      border: '1px solid #17A2B8',
      boxShadow: '0 4px 15px rgba(23, 162, 184, 0.15)',
    },
    success: {
      backgroundColor: '#E8F5E8', // Light green background
      border: '1px solid #3E8E5A', // Herbal green border
      boxShadow: '0 4px 15px rgba(62, 142, 90, 0.15)',
    },
    warning: {
      backgroundColor: '#FDF4E8', // Light orange background
      border: '1px solid #F4A261', // Soft orange border
      boxShadow: '0 4px 15px rgba(244, 162, 97, 0.15)',
    },
    danger: {
      backgroundColor: '#F8D7DA',
      border: '1px solid #DC3545',
      boxShadow: '0 4px 15px rgba(220, 53, 69, 0.15)',
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
      card.style.transform = 'translateY(-6px)';
      card.style.boxShadow = '0 15px 40px rgba(62, 142, 90, 0.18)'; // Enhanced herbal green shadow
      
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
