export const colors = {
  primary: {
    // Herbal Green - Main brand color (inspired by mobile app)
    herbalGreen: '#3E8E5A',
    darkGreen: '#2C5F41',
    lightGreen: '#4A9D6A',
    // Soft Orange - Secondary accent (inspired by mobile app)
    softOrange: '#F4A261',
    darkOrange: '#E8956D',
    lightOrange: '#F5B17A',
    // Professional Blue - Medical authority
    medicalBlue: '#2E5AAC',
    darkBlue: '#1E3F7A',
    lightBlue: '#4A7BC8',
    // Legacy colors for compatibility
    ayurvedaGold: '#F4A261',
    earthBrown: '#8D6E63',
    sageGreen: '#3E8E5A',
    trustBlue: '#2E5AAC',
  },
  secondary: {
    white: '#FFFFFF',
    lightGray: '#F5F7FA',
    warmGray: '#FAFAFA', // Mobile app cardBackground
    mediumGray: '#8E9BAE',
    charcoal: '#2C3E50',
    black: '#11181C', // Mobile app text color
    slate: '#546E7A',
    neutral: '#F8F9FA',
    inputBorder: '#E0E0E0', // Mobile app inputBorder
  },
  medical: {
    // Professional healthcare colors inspired by mobile app
    primary: '#3E8E5A', // herbalGreen
    secondary: '#F4A261', // softOrange
    background: '#F5F7FA',
    surface: '#FFFFFF',
    cardBackground: '#FAFAFA', // Mobile app cardBackground
    lightGreen: '#E8F5E8', // Mobile app lightGreen
    lightOrange: '#FDF4E8', // Mobile app lightOrange
    border: '#E1E8ED',
    text: {
      primary: '#11181C', // Mobile app text
      secondary: '#687076', // Mobile app icon
      sectionHeader: '#2C5F41', // Mobile app sectionHeader
      inverse: '#FFFFFF',
    },
    status: {
      critical: '#E74C3C',
      warning: '#F4A261', // Using mobile app softOrange
      success: '#3E8E5A', // Using mobile app herbalGreen
      info: '#3498DB',
    }
  },
  ayurveda: {
    // Refined Ayurvedic accent colors inspired by mobile app
    turmeric: '#F4A261', // softOrange
    neem: '#3E8E5A', // herbalGreen
    sandalwood: '#E8F5E8', // lightGreen
    lotus: '#FDF4E8', // lightOrange
    sacred: '#FAFAFA', // cardBackground
  },
  gradient: {
    primary: 'linear-gradient(135deg, #3E8E5A 0%, #4A9D6A 100%)', // herbalGreen gradient
    medical: 'linear-gradient(135deg, #3E8E5A 0%, #2C5F41 100%)', // herbalGreen to dark
    professional: 'linear-gradient(135deg, #F5F7FA 0%, #FFFFFF 100%)',
    card: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)', // Mobile app cardBackground
    hero: 'linear-gradient(135deg, #3E8E5A 0%, #F4A261 50%, #4A9D6A 100%)', // Mobile app colors
    dashboard: 'linear-gradient(135deg, rgba(62, 142, 90, 0.05) 0%, rgba(244, 162, 97, 0.05) 100%)', // Mobile app colors
    accent: 'linear-gradient(135deg, #E8F5E8 0%, #FDF4E8 100%)', // Light colors
  },
  background: {
    main: '#F5F7FA',
    surface: '#FFFFFF',
    pattern: 'rgba(62, 142, 90, 0.03)', // herbalGreen pattern
    card: '#FAFAFA', // Mobile app cardBackground
    professional: '#F8F9FA',
    lightGreen: '#E8F5E8', // Mobile app lightGreen
    lightOrange: '#FDF4E8', // Mobile app lightOrange
  },
  accent: {
    success: '#3E8E5A', // herbalGreen
    warning: '#F4A261', // softOrange
    error: '#E74C3C',
    info: '#3498DB',
    prescription: '#3E8E5A', // herbalGreen
  },
  shadow: {
    primary: 'rgba(62, 142, 90, 0.12)', // herbalGreen shadow
    secondary: 'rgba(0, 0, 0, 0.08)',
    medical: 'rgba(244, 162, 97, 0.15)', // softOrange shadow
    professional: 'rgba(44, 95, 65, 0.1)', // darkGreen shadow
  }
};
