import { getApiBaseUrl } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlanData {
  planType: 'ai' | 'doctor' | 'none';
  plan: any;
  hasCompletedAppointment: boolean;
  patientId: string;
}

export interface AIPlanData {
  recommendations: string[];
  restrictions: string[];
  mealPlan: any;
  createdAt: Date;
}

export class PlanService {
  static async getCurrentPlan(patientId: string): Promise<PlanData> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/plans/patient/${patientId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch current plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching current plan:', error);
      throw error;
    }
  }

  static async setAIPlan(patientId: string, planData: AIPlanData): Promise<any> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/plans/patient/${patientId}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planData }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to set AI plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error setting AI plan:', error);
      throw error;
    }
  }

  static async generateAIPlan(patientId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${getApiBaseUrl()}/plans/generate-ai-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to generate AI plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error generating AI plan:', error);
      throw error;
    }
  }

  static async resetPlan(patientId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${getApiBaseUrl()}/plans/patient/${patientId}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to reset plan');
      }

      return result.data;
    } catch (error) {
      console.error('Error resetting plan:', error);
      throw error;
    }
  }
}