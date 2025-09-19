import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './api';
import { NavigationService } from './navigation';

// Use consistent storage keys with API service
const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  PATIENT_DATA: '@patient_data',
  SURVEY_COMPLETED: '@survey_completed',
  USER_DATA: '@user_data',
};

export class AuthService {
  static async handleLoginFlow(email: string, password: string, authContext?: any): Promise<boolean> {
    try {
      console.log('🔐 Starting login flow for:', email);
      const response = await authApi.login(email, password);
      
      if (!response.success) {
        console.error('❌ Login failed:', response.error);
        return false;
      }

      console.log('✅ Login successful, checking survey status...');
      
      // Store patient data in AuthContext if available
      if (authContext && response.data?.user) {
        const user = response.data.user as any; // Type assertion for API response
        const patientData = {
          _id: user.id || user._id || 'temp_id', // Backend returns id, not _id
          name: user.name || user.fullName || 'User',
          email: user.email || email,
          phone: user.phone || user.mobileNumber || '',
          age: user.age || '',
          gender: user.gender || '',
          address: user.address || '',
          emergencyContact: user.emergencyContact || '',
          medicalHistory: user.medicalHistory || '',
          allergies: user.allergies || '',
          currentMedications: user.currentMedications || '',
          constitution: user.constitution || '',
          surveyCompleted: response.data.surveyCompleted || false,
        };
        
        await authContext.login(patientData);
        if (response.data.token) {
          await authContext.setToken(response.data.token);
        }
      }
      
      // Check if survey is completed
      const surveyCompleted = response.data?.surveyCompleted ?? false;
      console.log('📊 Survey completed:', surveyCompleted);
      
      if (!surveyCompleted) {
        console.log('📝 Redirecting to survey...');
        // Redirect to survey
        router.replace('/survey');
      } else {
        console.log('🎯 Checking user status for smart redirect...');
        // Use NavigationService to determine best redirect destination
        const userStatus = await NavigationService.getUserStatus();
        console.log('📍 User status:', userStatus.type, '-> Redirecting to:', userStatus.redirectPath);
        router.replace(userStatus.redirectPath as any);
      }

      return true;
    } catch (error) {
      console.error('❌ Login flow error:', error);
      return false;
    }
  }

  static async handleRegistrationFlow(userData: any, authContext?: any): Promise<boolean> {
    try {
      console.log('📝 Starting registration flow for:', userData.email);
      const response = await authApi.register(userData);
      
      if (!response.success) {
        console.error('❌ Registration failed:', response.error);
        return false;
      }

      console.log('✅ Registration successful, setting up auth context...');
      console.log('📊 Registration response data:', response.data);
      
      // Store patient data in AuthContext if available
      if (authContext && response.data?.user) {
        const user = response.data.user as any;
        const patientData = {
          _id: user.id || user._id || 'temp_id', // Backend returns id, not _id
          name: user.name || user.fullName || userData.name,
          email: user.email || userData.email,
          phone: user.phone || user.mobileNumber || userData.phone,
          age: user.age || '',
          gender: user.gender || '',
          address: user.address || '',
          emergencyContact: user.emergencyContact || '',
          medicalHistory: user.medicalHistory || '',
          allergies: user.allergies || '',
          currentMedications: user.currentMedications || '',
          constitution: user.constitution || '',
          surveyCompleted: false, // New registrations haven't completed survey
        };
        
        console.log('👤 Setting patient data in AuthContext:', patientData);
        await authContext.login(patientData);
        if (response.data.token) {
          await authContext.setToken(response.data.token);
          console.log('🔑 Token set in AuthContext');
        }
      }

      console.log('📝 Redirecting to survey...');
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

  static async handleSurveyCompletion(authContext?: any): Promise<void> {
    // After survey completion, update the stored auth status and redirect to plan selection
    console.log('📝 Survey completed, updating auth status...');
    try {
      // Update the survey completion status in AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.SURVEY_COMPLETED, JSON.stringify(true));
      console.log('📍 Survey completion status updated');
      
      // Also update the survey completion status in AuthContext if available
      if (authContext && authContext.patient) {
        await authContext.updatePatient({ surveyCompleted: true });
        console.log('📍 AuthContext patient survey status updated');
      }
    } catch (error) {
      console.error('Error updating survey completion status:', error);
    }
  }
}