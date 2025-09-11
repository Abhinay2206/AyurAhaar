import React from 'react';
import { colors } from '../../theme';

const AnimatedLogo = ({ size = 60 }) => {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Outer rotating circle */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: `${colors.primary.herbalGreen}80 ${colors.primary.teal}80 ${colors.primary.lightGreen}80 ${colors.primary.emerald}80`,
        animation: 'rotateClockwise 10s linear infinite',
        boxShadow: `0 0 10px ${colors.primary.herbalGreen}50`,
      }} />
      
      {/* Middle pulsing circle */}
      <div style={{
        position: 'absolute',
        width: '80%',
        height: '80%',
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${colors.primary.teal}15, transparent 80%)`,
        animation: 'pulse 3s ease-in-out infinite',
      }} />

      {/* Inner leaf shape */}
      <div style={{
        width: '50%',
        height: '50%',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2316a085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6.8 3.45c.87-.52 1.82-.92 2.83-1.17a8 8 0 0 0 7.3 14.42M2.08 9.03c.34 1.07.81 2.07 1.37 2.97a8 8 0 0 0 15.26-1.4'/%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E") center/contain no-repeat`,
        opacity: 0.9,
        animation: 'pulse 4s ease-in-out infinite alternate',
      }} />
      
      {/* Animated dots */}
      <div style={{
        position: 'absolute',
        width: '10%',
        height: '10%',
        borderRadius: '50%',
        background: colors.primary.herbalGreen,
        top: '15%',
        left: '15%',
        animation: 'orbit 8s linear infinite',
        opacity: 0.8,
      }} />
      
      <div style={{
        position: 'absolute',
        width: '8%',
        height: '8%',
        borderRadius: '50%',
        background: colors.primary.emerald,
        bottom: '20%',
        right: '15%',
        animation: 'orbit 8s linear infinite reverse',
        animationDelay: '1s',
        opacity: 0.8,
      }} />
    </div>
  );
};

export default AnimatedLogo;
