/**
 * API Configuration - Static IP Setup
 * 
 * Simple static IP configuration that can be easily changed as needed.
 * Update the SERVER_IP value to match your development server's IP address.
 */

export const API_CONFIG = {
  // Static server IP - change this to your development server's IP
  SERVER_IP: '10.202.243.27', // Update this IP address as needed
  PORT: '4000',
  
  // Platform-specific localhost configurations for emulators/simulators
  ANDROID_LOCALHOST: '10.0.2.2', // Android emulator's localhost
  IOS_LOCALHOST: '10.202.243.27',     // iOS simulator can use localhost
  WEB_LOCALHOST: 'localhost',     // Web can use localhost
};

export const getApiConfig = () => {
  return {
    serverIp: API_CONFIG.SERVER_IP,
    port: API_CONFIG.PORT,
    androidLocalhost: API_CONFIG.ANDROID_LOCALHOST,
    iosLocalhost: API_CONFIG.IOS_LOCALHOST,
    webLocalhost: API_CONFIG.WEB_LOCALHOST,
  };
};
