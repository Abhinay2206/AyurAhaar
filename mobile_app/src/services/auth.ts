import { router } from 'expo-router';
import { authApi } from './api';

export class AuthService {
  static async handleLoginFlow(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 Starting login flow for:', email);
      const response = await authApi.login(email, password);
      
      if (!response.success) {
        console.error('❌ Login failed:', response.error);
        return false;
      }

      console.log('✅ Login successful, checking survey status...');
      // Check if survey is completed
      const surveyCompleted = response.data?.surveyCompleted ?? false;
      console.log('📊 Survey completed:', surveyCompleted);
      
      if (!surveyCompleted) {
        console.log('📝 Redirecting to survey...');
        // Redirect to survey
        router.replace('/survey');
      } else {
        console.log('🎯 Redirecting to plan selection...');
        // Redirect to plan selection or dashboard
        router.replace('/plan-selection');
      }

      return true;
    } catch (error) {
      console.error('❌ Login flow error:', error);
      return false;
    }
  }

  static async handleRegistrationFlow(userData: any): Promise<boolean> {
    try {
      console.log('📝 Starting registration flow for:', userData.email);
      const response = await authApi.register(userData);
      
      if (!response.success) {
        console.error('❌ Registration failed:', response.error);
        return false;
      }

      console.log('✅ Registration successful, redirecting to survey...');
      // New users always need to complete survey
      router.replace('/survey');
      return true;
    } catch (error) {
      console.error('❌ Registration flow error:', error);
      return false;
    }
  }

  static async checkAuthStatus(): Promise<'unauthenticated' | 'survey-pending' | 'authenticated'> {
    try {
      const { token, user, surveyCompleted } = await authApi.getStoredAuth();
      
      if (!token || !user) {
        return 'unauthenticated';
      }

      if (!surveyCompleted) {
        return 'survey-pending';
      }

      return 'authenticated';
    } catch (error) {
      console.error('Auth status check error:', error);
      return 'unauthenticated';
    }
  }

  static async logout(): Promise<void> {
    await authApi.logout();
    router.replace('/auth');
  }

  static async handleSurveyCompletion(): Promise<void> {
    // After survey completion, redirect to plan selection
    router.replace('/plan-selection');
  }
}