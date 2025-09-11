import React from 'react';
import { colors, borderRadius, shadows, animations } from '../../theme';

const Card = ({ 
  children, 
  padding = '2rem', 
  variant = 'default',
  hover = true,
  glass = false,
  ...props 
}) => {
  const baseStyles = {
    borderRadius: borderRadius['2xl'],
    padding: padding,
    border: '1px solid rgba(245, 245, 243, 0.8)',
    transition: animations.transition.spring,
    position: 'relative',
    overflow: 'hidden',
  };

  const variants = {
    default: {
      backgroundColor: colors.background.card,
      boxShadow: shadows.professional,
      border: `1px solid ${colors.secondary.warmGray}`,
    },
    medical: {
      background: colors.background.professional,
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(25, 118, 210, 0.1)',
      boxShadow: shadows.medical,
    },
    gradient: {
      background: colors.gradient.card,
      boxShadow: shadows.lg,
    },
    elevated: {
      backgroundColor: colors.background.card,
      boxShadow: shadows['2xl'],
      transform: 'translateY(0)',
      border: `1px solid ${colors.secondary.warmGray}`,
    }
  };

  const cardStyles = {
    ...baseStyles,
    ...variants[glass ? 'medical' : variant],
    ...props.style,
  };

  const handleMouseEnter = (e) => {
    if (hover) {
      e.target.style.transform = 'translateY(-4px)';
      e.target.style.boxShadow = shadows.lg;
    }
  };

  const handleMouseLeave = (e) => {
    if (hover) {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = variants[glass ? 'medical' : variant].boxShadow;
    }
  };

  return (
    <div 
      style={cardStyles} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`animate-scale-in ${glass ? 'glass-effect' : ''}`}
      {...props}
    >
      {/* Subtle medical accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(45, 122, 50, 0.4), transparent)',
        zIndex: 1,
      }} />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
      
      {/* Subtle shine effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
        transform: 'rotate(45deg)',
        pointerEvents: 'none',
        opacity: 0.5,
      }} />
    </div>
  );
};

export default Card;
