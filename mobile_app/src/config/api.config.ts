/**
 * API Configuration - Dynamic IP Discovery
 * 
 * This configuration now supports dynamic IP detection to automatically
 * find the development server regardless of network changes.
 * 
 * How it works:
 * 1. Gets the device's current IP address (e.g., 192.168.1.105)
 * 2. Extracts the network base (e.g., 192.168.1)
 * 3. Generates potential server IPs in the same network:
 *    - 192.168.1.1-10 (router/gateway range)
 *    - 192.168.1.100-110 (common dev server range)
 *    - 192.168.1.200-210 (alternative dev range)
 * 4. Tests each IP by calling /health endpoint
 * 5. Caches the working IP for the session
 * 
 * Benefits:
 * - No need to manually update IP addresses
 * - Works automatically when switching networks (WiFi, mobile hotspot, etc.)
 * - Falls back gracefully if discovery fails
 * 
 * Manual controls:
 * - Use "Test API" button in app to see discovered IP
 * - Use "Rediscover" to force new IP discovery
 * - Use "Reset Cache" to clear cached IP
 */

export const API_CONFIG = {
  // Fallback IP - will be replaced by dynamic detection
  FALLBACK_DEVELOPMENT_IP: '192.168.1.100', // Generic fallback
  PORT: '4000',
  
  // Development server discovery settings
  DISCOVERY: {
    // Common development server IP patterns to try
    COMMON_PORTS: ['4000'], // Add more ports if needed
    // IP ranges to scan (last octet ranges)
    SCAN_RANGES: [
      { start: 1, end: 10 },   // Router/gateway range (.1-.10)
      { start: 100, end: 110 }, // Common dev server range (.100-.110)
      { start: 200, end: 210 }, // Alternative dev range (.200-.210)
    ],
    TIMEOUT_MS: 2000, // Timeout for each IP test
  },
  
  // Platform-specific localhost configurations
  ANDROID_LOCALHOST: '10.0.2.2', // Android emulator's localhost
  IOS_LOCALHOST: 'localhost',     // iOS simulator can use localhost
  WEB_LOCALHOST: 'localhost',     // Web can use localhost
};

export const getApiConfig = () => {
  return {
    fallbackDevelopmentIp: API_CONFIG.FALLBACK_DEVELOPMENT_IP,
    port: API_CONFIG.PORT,
    discovery: API_CONFIG.DISCOVERY,
    androidLocalhost: API_CONFIG.ANDROID_LOCALHOST,
    iosLocalhost: API_CONFIG.IOS_LOCALHOST,
    webLocalhost: API_CONFIG.WEB_LOCALHOST,
  };
};
