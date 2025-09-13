import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl, ApiResponse } from './api';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
} as const;

export interface PatientProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  weight?: number;
  height?: number;
  lifestyle?: string;
  allergies?: string[];
  healthConditions?: string[];
  surveyCompleted: boolean;
  currentPlan: {
    type: 'ai' | 'doctor' | 'none';
    planId?: string;
    isVisible: boolean;
    createdAt?: Date;
    lastModified?: Date;
  };
  appointments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDashboard {
  profile: {
    name: string;
    email: string;
    phone?: string;
    age?: number;
    weight?: number;
    height?: number;
    lifestyle?: string;
    surveyCompleted: boolean;
  };
  currentPlan: {
    type: 'ai' | 'doctor' | 'none';
    planId?: string;
    isVisible: boolean;
    createdAt?: Date;
    lastModified?: Date;
  };
  statistics: {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    hasPlan: boolean;
  };
  recentAppointments: any[];
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  age?: number;
  weight?: number;
  height?: number;
  lifestyle?: string;
  allergies?: string[];
  healthConditions?: string[];
}

export interface UpdatePlanData {
  type: 'ai' | 'doctor' | 'none';
  planId?: string;
  isVisible?: boolean;
}

export class PatientService {
  private static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/patients${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Request failed' };
      }

      return { success: true, data: data.data || data };
    } catch (error) {
      console.error('Patient API error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  /**
   * Get patient profile
   */
  static async getProfile(): Promise<ApiResponse<PatientProfile>> {
    console.log('📄 Fetching patient profile...');
    return this.makeRequest<PatientProfile>('/profile');
  }

  /**
   * Update patient profile
   */
  static async updateProfile(updates: UpdateProfileData): Promise<ApiResponse<PatientProfile>> {
    console.log('📝 Updating patient profile:', updates);
    return this.makeRequest<PatientProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Get dashboard data
   */
  static async getDashboard(): Promise<ApiResponse<PatientDashboard>> {
    console.log('📊 Fetching dashboard data...');
    return this.makeRequest<PatientDashboard>('/dashboard');
  }

  /**
   * Update survey completion status
   */
  static async updateSurveyStatus(surveyCompleted: boolean): Promise<ApiResponse<{ surveyCompleted: boolean }>> {
    console.log('📋 Updating survey status:', surveyCompleted);
    return this.makeRequest<{ surveyCompleted: boolean }>('/survey-status', {
      method: 'PUT',
      body: JSON.stringify({ surveyCompleted }),
    });
  }

  /**
   * Update patient plan
   */
  static async updatePlan(planData: UpdatePlanData): Promise<ApiResponse<{ currentPlan: any }>> {
    console.log('📋 Updating patient plan:', planData);
    return this.makeRequest<{ currentPlan: any }>('/plan', {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  /**
   * Get current user status for navigation
   */
  static async getUserStatus(): Promise<{
    hasPlans: boolean;
    hasAppointments: boolean;
    shouldShowPlanSelection: boolean;
    redirectPath: string;
  }> {
    try {
      const dashboardResponse = await this.getDashboard();
      
      if (!dashboardResponse.success || !dashboardResponse.data) {
        return {
          hasPlans: false,
          hasAppointments: false,
          shouldShowPlanSelection: true,
          redirectPath: '/plan-selection'
        };
      }

      const data = dashboardResponse.data;
      const hasPlans = data.currentPlan.type !== 'none' && data.currentPlan.isVisible;
      const hasAppointments = data.statistics.totalAppointments > 0;
      const shouldShowPlanSelection = !hasPlans && !hasAppointments;

      return {
        hasPlans,
        hasAppointments,
        shouldShowPlanSelection,
        redirectPath: shouldShowPlanSelection ? '/plan-selection' : '/dashboard'
      };
    } catch (error) {
      console.error('Error getting user status:', error);
      return {
        hasPlans: false,
        hasAppointments: false,
        shouldShowPlanSelection: true,
        redirectPath: '/plan-selection'
      };
    }
  }

  /**
   * Clear cached profile data (useful for logout)
   */
  static async clearCachedData(): Promise<void> {
    // If we implement caching in the future, clear it here
    console.log('🧹 Clearing patient cached data...');
  }
}

export default PatientService;