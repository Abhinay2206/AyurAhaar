export const animations = {
  transition: {
    default: 'all 0.3s ease',
    fast: 'all 0.2s ease',
    slow: 'all 0.5s ease',
    spring: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  duration: {
    fast: '0.2s',
    default: '0.3s',
    slow: '0.5s',
    extraSlow: '0.8s',
  },
  timing: {
    default: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  keyframes: {
    fadeIn: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }',
    slideUp: '@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }',
    pulse: '@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }',
    float: '@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }',
    spin: '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }',
  }
};
