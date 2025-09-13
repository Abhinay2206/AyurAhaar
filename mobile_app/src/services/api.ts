// API Service functions will go here
// Example: auth, survey, user profile APIs
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG } from '../config/api.config';

// Storage keys - keep consistent with AuthContext
const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  PATIENT_DATA: '@patient_data',
  SURVEY_COMPLETED: '@survey_completed',
  USER_DATA: '@user_data', // Legacy key for backward compatibility
};

// Simple function to get the correct API base URL
export function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return `http://${API_CONFIG.WEB_LOCALHOST}:${API_CONFIG.PORT}/api`;
  }
  
  if (__DEV__) {
    // For development, use platform-specific localhost or static server IP
    if (Platform.OS === 'ios') {
      return `http://${API_CONFIG.IOS_LOCALHOST}:${API_CONFIG.PORT}/api`;
    } else if (Platform.OS === 'android') {
      return `http://${API_CONFIG.ANDROID_LOCALHOST}:${API_CONFIG.PORT}/api`;
    } else {
      // For real devices, use the static server IP
      return `http://${API_CONFIG.SERVER_IP}:${API_CONFIG.PORT}/api`;
    }
  }
  
  // For production, use the static server IP
  return `http://${API_CONFIG.SERVER_IP}:${API_CONFIG.PORT}/api`;
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

export interface PrakritiQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  options: {
    index: number;
    text: string;
  }[];
}

export interface PrakritiAssessmentResult {
  primary: string;
  secondary?: string;
  isDual: boolean;
  percentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
}

// Auth API methods
export const authApi = {
  async login(email: string, password: string, role: string = 'patient'): Promise<ApiResponse<LoginResponse>> {
    try {
      const apiUrl = getApiBaseUrl();
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
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      if (data.surveyCompleted !== undefined) {
        await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, JSON.stringify(data.surveyCompleted));
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async register(userData: any): Promise<ApiResponse<LoginResponse>> {
    try {
      const apiUrl = getApiBaseUrl();
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
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      // New users haven't completed survey
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, 'false');

      return { success: true, data };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN, 
      STORAGE_KEYS.USER_DATA, 
      STORAGE_KEYS.SURVEY_COMPLETED,
      STORAGE_KEYS.PATIENT_DATA, // Also clear patient data
      // Legacy keys for backward compatibility
      'auth_token',
      'user_data', 
      'survey_completed'
    ]);
  },

  async getStoredAuth(): Promise<{ token: string | null; user: User | null; surveyCompleted: boolean }> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    const surveyCompleted = await AsyncStorage.getItem(STORAGE_KEYS.SURVEY_COMPLETED);
    
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
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
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
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
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

// Prakriti Assessment API methods
export const prakritiApi = {
  async getQuestions(): Promise<ApiResponse<{ questions: PrakritiQuestion[] }>> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/prakriti/questions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to get Prakriti questions' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get Prakriti questions error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async startAssessment(): Promise<ApiResponse<{ assessmentId: string; completedQuestions: number }>> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/prakriti/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to start Prakriti assessment' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Start Prakriti assessment error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async submitAnswer(assessmentId: string, questionNumber: number, selectedOption: number): Promise<ApiResponse<{
    completedQuestions: number;
    totalQuestions: number;
    isAssessmentComplete: boolean;
    currentScores: { vata: number; pitta: number; kapha: number };
    prakritiResult?: PrakritiAssessmentResult;
  }>> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/prakriti/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          assessmentId,
          questionNumber,
          selectedOption,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to submit answer' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Submit Prakriti answer error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async getAssessmentProgress(assessmentId: string): Promise<ApiResponse<{
    id: string;
    completedQuestions: number;
    totalQuestions: number;
    isCompleted: boolean;
    responses: { [questionNumber: string]: number };
    currentScores: { vata: number; pitta: number; kapha: number };
    prakritiResult?: PrakritiAssessmentResult;
  }>> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/prakriti/progress/${assessmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to get assessment progress' };
      }

      return { success: true, data: data.assessment };
    } catch (error) {
      console.error('Get assessment progress error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async getCurrentPrakriti(): Promise<ApiResponse<{
    prakritiCompleted: boolean;
    currentPrakriti?: {
      assessmentId: string;
      primaryDosha: string;
      secondaryDosha?: string;
      isDual: boolean;
      completedAt: string;
      isValid: boolean;
    };
  }>> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/prakriti/current`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Failed to get current Prakriti' };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get current Prakriti error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  },
};

// Placeholder for future API services
export const apiService = {
  auth: authApi,
  survey: surveyApi,
  prakriti: prakritiApi,
};

// Simple function to test API connectivity
export async function testApiConnection(): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    const apiUrl = getApiBaseUrl();
    const response = await fetch(`${apiUrl.replace('/api', '')}/health`);
    const data = await response.json();
    
    return {
      success: response.ok,
      url: apiUrl,
      ...(data && { data })
    };
  } catch (error) {
    const apiUrl = getApiBaseUrl();
    return {
      success: false,
      url: apiUrl,
      error: String(error)
    };
  }
}
