import React from 'react';
import { colors } from '../../theme';

const AnimatedBackground = ({ variant = 'default' }) => {
  const backgroundVariants = {
    default: {
      background: colors.gradient.subtle,
    },
    waves: {
      position: 'relative',
      background: colors.secondary.lightGray,
      overflow: 'hidden',
    },
    gradient: {
      background: `linear-gradient(135deg, ${colors.primary.herbalGreen}05, ${colors.primary.teal}10, ${colors.secondary.white})`,
    },
    dots: {
      position: 'relative',
      background: colors.secondary.white,
    },
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      ...backgroundVariants[variant],
    }}>
      {variant === 'waves' && (
        <>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '50%',
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%2316a08505'%3E%3C/path%3E%3C/svg%3E") bottom center/100% auto no-repeat`,
            animation: 'wave 20s linear infinite',
            opacity: 0.6,
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '45%',
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%2327ae6008'%3E%3C/path%3E%3C/svg%3E") bottom center/100% auto no-repeat`,
            animation: 'wave 15s linear infinite reverse',
            opacity: 0.4,
          }} />
        </>
      )}
      
      {variant === 'dots' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${colors.primary.herbalGreen}08 2px, transparent 2px),
            radial-gradient(circle at 70% 20%, ${colors.primary.softOrange}08 1px, transparent 1px),
            radial-gradient(circle at 40% 70%, ${colors.primary.lightGreen}08 2px, transparent 2px),
            radial-gradient(circle at 80% 50%, ${colors.primary.teal}08 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 60px 60px, 70px 70px, 50px 50px',
          opacity: 0.7,
        }} />
      )}
    </div>
  );
};

export default AnimatedBackground;
