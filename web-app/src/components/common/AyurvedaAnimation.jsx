import React from 'react';
import { colors } from '../../theme';

const AyurvedaAnimation = () => {
  return (
    <div className="ayurveda-animation" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* Floating herbs and ingredients */}
      <div className="floating-element leaf" style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '60px',
        height: '60px',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2316a085' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 2c-1.35 1.5-2.092 3-2.5 4.5M9 2c1.35 1.5 2.092 3 2.5 4.5M2 15c1.5-1.35 3-2.092 4.5-2.5M2 9c1.5 1.35 3 2.092 4.5 2.5M22 15c-1.5-1.35-3-2.092-4.5-2.5M22 9c-1.5 1.35-3 2.092-4.5 2.5M15 22c-1.35-1.5-2.092-3-2.5-4.5M9 22c1.35-1.5 2.092-3 2.5-4.5'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E") center/contain no-repeat`,
        opacity: 0.4,
        animation: 'float 20s ease-in-out infinite, rotateClockwise 30s linear infinite',
      }} />

      <div className="floating-element spice" style={{
        position: 'absolute',
        top: '70%',
        right: '15%',
        width: '40px',
        height: '40px',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23e67e22' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3Cpath d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83'/%3E%3C/svg%3E") center/contain no-repeat`,
        opacity: 0.5,
        animation: 'float 25s ease-in-out infinite, rotateCounterClockwise 35s linear infinite',
        animationDelay: '1s',
      }} />

      <div className="floating-element mortar" style={{
        position: 'absolute',
        bottom: '10%',
        left: '20%',
        width: '50px',
        height: '50px',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2327ae60' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 3h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2z'/%3E%3Cpath d='M2 15h20'/%3E%3Cpath d='M2 11v4'/%3E%3Cpath d='M22 11v4'/%3E%3Cpath d='M7 19h10'/%3E%3Cpath d='M12 15v4'/%3E%3C/svg%3E") center/contain no-repeat`,
        opacity: 0.6,
        animation: 'float 30s ease-in-out infinite, pulse 4s ease-in-out infinite',
        animationDelay: '0.5s',
      }} />

      <div className="floating-element leaf-2" style={{
        position: 'absolute',
        top: '40%',
        right: '10%',
        width: '45px',
        height: '45px',
        background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%231abc9c' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/svg%3E") center/contain no-repeat`,
        opacity: 0.5,
        animation: 'float 28s ease-in-out infinite, rotateClockwise 25s linear infinite',
        animationDelay: '0.7s',
      }} />
      
      {/* Add shining circles and decorative elements */}
      <div className="decoration circle-1" style={{
        position: 'absolute',
        top: '30%',
        left: '30%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${colors.primary.herbalGreen}15, transparent 70%)`,
        animation: 'pulse 8s ease-in-out infinite',
      }} />
      
      <div className="decoration circle-2" style={{
        position: 'absolute',
        bottom: '20%',
        right: '25%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${colors.primary.softOrange}15, transparent 70%)`,
        animation: 'pulse 6s ease-in-out infinite',
        animationDelay: '1s',
      }} />
      
      <div className="decoration line-1" style={{
        position: 'absolute',
        top: '15%',
        left: '5%',
        width: '100px',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${colors.primary.herbalGreen}30, transparent)`,
        animation: 'stretch 10s ease-in-out infinite',
        transform: 'rotate(30deg)',
      }} />
      
      <div className="decoration line-2" style={{
        position: 'absolute',
        bottom: '25%',
        right: '10%',
        width: '80px',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${colors.primary.softOrange}30, transparent)`,
        animation: 'stretch 8s ease-in-out infinite',
        transform: 'rotate(-20deg)',
        animationDelay: '0.5s',
      }} />
      
      {/* Animated dots pattern */}
      <div className="dots-pattern" style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 30%, ${colors.primary.herbalGreen}10 1px, transparent 1px),
          radial-gradient(circle at 80% 70%, ${colors.primary.softOrange}10 1px, transparent 1px),
          radial-gradient(circle at 60% 40%, ${colors.primary.lightGreen}10 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.3,
        animation: 'pulse 10s ease-in-out infinite',
      }} />
    </div>
  );
};

export default AyurvedaAnimation;
