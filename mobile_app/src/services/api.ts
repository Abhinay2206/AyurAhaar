// API Service functions will go here
// Example: auth, survey, user profile APIs
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Network from 'expo-network';
import { API_CONFIG } from '../config/api.config';

// Function to get the correct API base URL
async function getApiBaseUrl(): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      return `http://${API_CONFIG.WEB_LOCALHOST}:${API_CONFIG.PORT}/api`;
    }
    
    // For iOS simulator, we can use localhost
    if (Platform.OS === 'ios' && __DEV__) {
      return `http://${API_CONFIG.IOS_LOCALHOST}:${API_CONFIG.PORT}/api`;
    }
    
    // For Android emulator, use 10.0.2.2
    if (Platform.OS === 'android' && __DEV__) {
      return `http://${API_CONFIG.ANDROID_LOCALHOST}:${API_CONFIG.PORT}/api`;
    }
    
    // For real devices, try to get the local IP and discover server
    const discoveredIp = await discoverDevelopmentServerIp();
    if (discoveredIp) {
      return `http://${discoveredIp}:${API_CONFIG.PORT}/api`;
    }
    
    // Fallback to configured development IP
    return `http://${API_CONFIG.FALLBACK_DEVELOPMENT_IP}:${API_CONFIG.PORT}/api`;
  } catch (error) {
    console.log('Error getting IP:', error);
    // Fallback to configured development IP
    return `http://${API_CONFIG.FALLBACK_DEVELOPMENT_IP}:${API_CONFIG.PORT}/api`;
  }
}

// Dynamic IP discovery function
async function discoverDevelopmentServerIp(): Promise<string | null> {
  try {
    console.log('🔍 Starting dynamic IP discovery...');
    
    // Get device's current IP address
    const deviceIp = await Network.getIpAddressAsync();
    if (!deviceIp) {
      console.log('❌ Could not get device IP');
      return null;
    }
    
    console.log('📱 Device IP:', deviceIp);
    
    // Extract network base (e.g., "192.168.1.100" -> "192.168.1")
    const networkBase = deviceIp.substring(0, deviceIp.lastIndexOf('.'));
    console.log('🌐 Network base:', networkBase);
    
    // Generate potential server IPs to test
    const potentialIps: string[] = [];
    
    // Add common development server IPs in the same network
    for (const range of API_CONFIG.DISCOVERY.SCAN_RANGES) {
      for (let i = range.start; i <= range.end; i++) {
        potentialIps.push(`${networkBase}.${i}`);
      }
    }
    
    console.log(`🎯 Testing ${potentialIps.length} potential server IPs...`);
    
    // Test each potential IP
    for (const ip of potentialIps) {
      console.log(`🔍 Testing server IP: ${ip}`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.DISCOVERY.TIMEOUT_MS);
        
        const response = await fetch(`http://${ip}:${API_CONFIG.PORT}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            console.log(`✅ Found development server at: ${ip}`);
            return ip;
          }
        }
      } catch {
        // Silent failure for individual IP tests
        // console.log(`❌ Server not found at ${ip}`);
      }
    }
    
    console.log('⚠️ No development server found in network range');
    return null;
  } catch (error) {
    console.error('❌ IP discovery error:', error);
    return null;
  }
}

// Test multiple URLs to find working one
async function testApiUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Remove /api from the URL since health endpoint is at root level
    const baseUrl = url.replace('/api', '');
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('API test failed for', url, ':', error);
    return false;
  }
}

async function findWorkingApiUrl(): Promise<string> {
  console.log('🔧 Testing API connection...');
  const baseUrls = [];
  
  if (Platform.OS === 'ios' && __DEV__) {
    // For iOS simulator, try localhost first, then dynamic discovery
    baseUrls.push(`http://${API_CONFIG.IOS_LOCALHOST}:${API_CONFIG.PORT}/api`);
    baseUrls.push(`http://127.0.0.1:${API_CONFIG.PORT}/api`);
    
    // Add dynamically discovered IP
    const discoveredIp = await discoverDevelopmentServerIp();
    if (discoveredIp) {
      baseUrls.push(`http://${discoveredIp}:${API_CONFIG.PORT}/api`);
    }
    
    // Fallback to configured IP
    baseUrls.push(`http://${API_CONFIG.FALLBACK_DEVELOPMENT_IP}:${API_CONFIG.PORT}/api`);
  } else if (Platform.OS === 'android' && __DEV__) {
    // For Android emulator
    baseUrls.push(`http://${API_CONFIG.ANDROID_LOCALHOST}:${API_CONFIG.PORT}/api`);
    
    // Add dynamically discovered IP
    const discoveredIp = await discoverDevelopmentServerIp();
    if (discoveredIp) {
      baseUrls.push(`http://${discoveredIp}:${API_CONFIG.PORT}/api`);
    }
    
    // Fallback
    baseUrls.push(`http://${API_CONFIG.FALLBACK_DEVELOPMENT_IP}:${API_CONFIG.PORT}/api`);
  } else if (Platform.OS === 'web') {
    baseUrls.push(`http://${API_CONFIG.WEB_LOCALHOST}:${API_CONFIG.PORT}/api`);
  } else {
    // For real devices, prioritize dynamic discovery
    const discoveredIp = await discoverDevelopmentServerIp();
    if (discoveredIp) {
      baseUrls.push(`http://${discoveredIp}:${API_CONFIG.PORT}/api`);
    }
    
    // Fallback
    baseUrls.push(`http://${API_CONFIG.FALLBACK_DEVELOPMENT_IP}:${API_CONFIG.PORT}/api`);
  }

  console.log(`📱 Platform: ${Platform.OS}, DEV: ${__DEV__}`);
  console.log(`🔍 Testing ${baseUrls.length} potential API URLs...`);

  for (const url of baseUrls) {
    console.log('🔍 Testing API URL:', url);
    const works = await testApiUrl(url);
    if (works) {
      console.log('✅ Found working API URL:', url);
      return url;
    }
  }

  console.log('⚠️ No working API URL found, using fallback:', baseUrls[0]);
  return baseUrls[0]; // Return first URL as fallback
}

// Cache the API URL to avoid repeated network calls
let cachedApiUrl: string | null = null;

// Function to reset cache (useful for debugging)
export function resetApiUrlCache(): void {
  cachedApiUrl = null;
  console.log('🔄 API URL cache reset - will discover IP on next request');
}

// Function to manually trigger IP discovery (useful for network changes)
export async function rediscoverApiUrl(): Promise<string> {
  console.log('🔄 Manually triggering API URL rediscovery...');
  cachedApiUrl = null;
  const newUrl = await findWorkingApiUrl();
  console.log('🎯 Rediscovered API URL:', newUrl);
  return newUrl;
}

async function getApiUrl(): Promise<string> {
  if (!cachedApiUrl) {
    console.log('🔄 No cached API URL, finding working URL...');
    cachedApiUrl = await findWorkingApiUrl();
    console.log('✅ Cached API base URL:', cachedApiUrl);
  } else {
    console.log('♻️ Using cached API URL:', cachedApiUrl);
  }
  return cachedApiUrl;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  surveyCompleted?: boolean;
}

export interface SurveyData {
  age: number;
  weight: number;
  height: number;
  lifestyle: string;
  allergies?: string[];
  healthConditions?: string[];
}

// Auth API methods
export const authApi = {
  async login(email: string, password: string, role: string = 'patient'): Promise<ApiResponse<LoginResponse>> {
    try {
      const apiUrl = await getApiUrl();
      console.log('🔗 Attempting login to:', `${apiUrl}/auth/patient/login`);
      console.log('📤 Login data:', { email, role });
      
      const response = await fetch(`${apiUrl}/auth/patient/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      // Store token
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      if (data.surveyCompleted !== undefined) {
        await AsyncStorage.setItem('survey_completed', JSON.stringify(data.surveyCompleted));
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async register(userData: any): Promise<ApiResponse<LoginResponse>> {
    try {
      const apiUrl = await getApiUrl();
      console.log('🔗 Attempting registration to:', `${apiUrl}/auth/patient/register`);
      console.log('📤 Registration data:', { ...userData, password: '[HIDDEN]' });
      
      const response = await fetch(`${apiUrl}/auth/patient/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, role: 'patient' }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      // Store token
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      // New users haven't completed survey
      await AsyncStorage.setItem('survey_completed', 'false');

      return { success: true, data };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['auth_token', 'user_data', 'survey_completed']);
  },

  async getStoredAuth(): Promise<{ token: string | null; user: User | null; surveyCompleted: boolean }> {
    const token = await AsyncStorage.getItem('auth_token');
    const userData = await AsyncStorage.getItem('user_data');
    const surveyCompleted = await AsyncStorage.getItem('survey_completed');
    
    return {
      token,
      user: userData ? JSON.parse(userData) : null,
      surveyCompleted: surveyCompleted ? JSON.parse(surveyCompleted) : false,
    };
  },
};

// Survey API methods
export const surveyApi = {
  async submitSurvey(surveyData: SurveyData): Promise<ApiResponse<any>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/survey/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(surveyData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Survey submission failed' };
      }

      // Update local storage
      await AsyncStorage.setItem('survey_completed', 'true');

      return { success: true, data };
    } catch (error) {
      console.error('Survey submission error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async getSurveyStatus(): Promise<ApiResponse<{ surveyCompleted: boolean; surveyData?: SurveyData }>> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = await getApiUrl();
      const response = await fetch(`${apiUrl}/survey/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to get survey status' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get survey status error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },
};

// Placeholder for future API services
export const apiService = {
  auth: authApi,
  survey: surveyApi,
};

// Debug function to test API connectivity
export async function testApiConnection(): Promise<{ success: boolean; url: string; error?: string; discoveredIp?: string }> {
  try {
    // First try to discover IP dynamically
    const discoveredIp = await discoverDevelopmentServerIp();
    
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
    const data = await response.json();
    
    return {
      success: response.ok,
      url: apiUrl,
      discoveredIp: discoveredIp || undefined,
      ...(data && { data })
    };
  } catch (error) {
    const apiUrl = await getApiUrl();
    return {
      success: false,
      url: apiUrl,
      error: String(error)
    };
  }
}
