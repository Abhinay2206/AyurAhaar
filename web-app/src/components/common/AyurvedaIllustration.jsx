import React from 'react';
import { colors } from '../../theme';

const AyurvedaIllustration = () => {
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '3rem',
    position: 'relative',
    background: colors.gradient.hero,
    overflow: 'hidden',
  };

  const patternStyles = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 25%, ${colors.shadow.primary} 2px, transparent 2px),
      radial-gradient(circle at 80% 75%, ${colors.shadow.primary} 1.5px, transparent 1.5px),
      radial-gradient(circle at 40% 60%, ${colors.shadow.primary} 1px, transparent 1px)
    `,
    backgroundSize: '80px 80px, 60px 60px, 40px 40px',
    opacity: 0.4,
    animation: 'float 8s ease-in-out infinite',
  };

  const illustrationStyles = {
    fontSize: '6rem',
    marginBottom: '2rem',
    zIndex: 3,
    position: 'relative',
    display: 'flex',
    gap: '1rem',
    animation: 'float 3s ease-in-out infinite',
  };

  const textStyles = {
    textAlign: 'center',
    zIndex: 3,
    position: 'relative',
    color: colors.secondary.white,
  };

  const titleStyles = {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    fontFamily: '"Poppins", sans-serif',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    animation: 'fadeIn 1s ease-out',
  };

  const subtitleStyles = {
    fontSize: '1.35rem',
    fontWeight: '400',
    lineHeight: '1.7',
    maxWidth: '500px',
    fontFamily: '"Inter", sans-serif',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    animation: 'slideUp 1s ease-out 0.3s both',
  };

  const featureList = [
    { icon: '🩺', text: 'Clinical Assessment Tools' },
    { icon: '�', text: 'Patient Care Management' },
    { icon: '🌿', text: 'Traditional Ayurvedic Wisdom' },
  ];

  const floatingElementStyle = (delay) => ({
    position: 'absolute',
    fontSize: '2rem',
    opacity: 0.3,
    animation: `float 4s ease-in-out infinite ${delay}s`,
    zIndex: 1,
  });

  return (
    <div style={containerStyles}>
      <div style={patternStyles}></div>
      
      {/* Floating decorative elements */}
      <div style={{ ...floatingElementStyle(0), top: '15%', left: '10%' }}>🕉️</div>
      <div style={{ ...floatingElementStyle(1), bottom: '20%', right: '15%' }}>🌸</div>
      <div style={{ ...floatingElementStyle(2), top: '70%', left: '8%' }}>🍃</div>
      <div style={{ ...floatingElementStyle(1.5), top: '25%', right: '12%' }}>🌿</div>
      <div style={{ ...floatingElementStyle(0.5), bottom: '60%', left: '15%' }}>🩺</div>
      
      {/* Gradient overlay circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite',
        zIndex: 1,
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
        animation: 'float 4s ease-in-out infinite 2s',
        zIndex: 1,
      }} />
      
      {/* Main illustration */}
      <div style={illustrationStyles}>
        <span style={{ animationDelay: '0s' }}>🌿</span>
        <span style={{ animationDelay: '0.5s' }}>👨‍⚕️</span>
        <span style={{ animationDelay: '1s' }}>📋</span>
      </div>
      
      <div style={textStyles}>
        <h1 style={titleStyles}>
          AyurAhaar Medical Portal
        </h1>
        <p style={subtitleStyles}>
          Professional healthcare platform for Ayurvedic practitioners to deliver comprehensive patient care and traditional treatment protocols
        </p>
        
        {/* Feature highlights */}
        <div style={{
          marginTop: '3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'fadeIn 1s ease-out 0.6s both',
        }}>
          {featureList.map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              fontWeight: '500',
              animation: `slideUp 0.5s ease-out ${0.8 + index * 0.1}s both`,
            }}>
              <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
              {feature.text}
            </div>
          ))}
        </div>
      </div>
      
      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
    </div>
  );
};

export default AyurvedaIllustration;
