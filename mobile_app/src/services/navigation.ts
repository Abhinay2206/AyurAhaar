import { AuthService } from './auth';
import { PlanService } from './plan';
import { AppointmentService } from './appointment';
import { authApi } from './api';
import { router } from 'expo-router';

export interface UserStatus {
  type: 'unauthenticated' | 'survey-pending' | 'dashboard-ready' | 'plan-selection-needed';
  redirectPath: string;
  hasPlans: boolean;
  hasAppointments: boolean;
}

/**
 * Service to determine user's current status and appropriate redirect destination
 */
export class NavigationService {
  /**
   * Check user's authentication status and determine where to redirect them
   */
  static async getUserStatus(): Promise<UserStatus> {
    try {
      // First check basic auth status
      const authStatus = await AuthService.checkAuthStatus();
      
      if (authStatus === 'unauthenticated') {
        return {
          type: 'unauthenticated',
          redirectPath: '/home',
          hasPlans: false,
          hasAppointments: false,
        };
      }
      
      if (authStatus === 'survey-pending') {
        return {
          type: 'survey-pending',
          redirectPath: '/survey',
          hasPlans: false,
          hasAppointments: false,
        };
      }
      
      // User is authenticated, now check if they have plans or appointments
      const { user } = await authApi.getStoredAuth();
      if (!user) {
        return {
          type: 'unauthenticated',
          redirectPath: '/home',
          hasPlans: false,
          hasAppointments: false,
        };
      }
      
      // Check for existing plans and appointments
      const [planData, appointments] = await Promise.all([
        this.checkUserPlans(user.id),
        this.checkUserAppointments(user.id),
      ]);
      
      const hasPlans = planData.hasPlans;
      const hasAppointments = appointments.hasAppointments;
      
      // If user has either plans or appointments, redirect to dashboard
      if (hasPlans || hasAppointments) {
        return {
          type: 'dashboard-ready',
          redirectPath: '/dashboard',
          hasPlans,
          hasAppointments,
        };
      }
      
      // User is authenticated but has no plans or appointments, go to plan selection
      return {
        type: 'plan-selection-needed',
        redirectPath: '/plan-selection',
        hasPlans: false,
        hasAppointments: false,
      };
      
    } catch (error) {
      console.error('Error checking user status:', error);
      // On error, default to home screen
      return {
        type: 'unauthenticated',
        redirectPath: '/home',
        hasPlans: false,
        hasAppointments: false,
      };
    }
  }
  
  /**
   * Check if user has any active plans
   */
  private static async checkUserPlans(userId: string): Promise<{ hasPlans: boolean }> {
    try {
      const planData = await PlanService.getCurrentPlan(userId);
      return {
        hasPlans: planData !== null && planData.planType !== 'none',
      };
    } catch (error) {
      console.error('Error checking user plans:', error);
      return { hasPlans: false };
    }
  }
  
  /**
   * Check if user has any appointments (past or upcoming)
   */
  private static async checkUserAppointments(userId: string): Promise<{ hasAppointments: boolean }> {
    try {
      const appointments = await AppointmentService.getPatientAppointments(userId);
      return {
        hasAppointments: appointments && appointments.length > 0,
      };
    } catch (error) {
      console.error('Error checking user appointments:', error);
      return { hasAppointments: false };
    }
  }
  
  /**
   * Get the appropriate redirect path based on user's current state
   */
  static async getRedirectPath(): Promise<string> {
    const userStatus = await this.getUserStatus();
    return userStatus.redirectPath;
  }
  
  /**
   * Check if user should be redirected to dashboard
   */
  static async shouldRedirectToDashboard(): Promise<boolean> {
    const userStatus = await this.getUserStatus();
    return userStatus.type === 'dashboard-ready';
  }
  
  /**
   * Manually trigger navigation based on current user status
   * Useful for refreshing navigation state
   */
  static async navigateToAppropriateScreen(): Promise<void> {
    const userStatus = await this.getUserStatus();
    console.log('🔄 Manual navigation - User status:', userStatus.type);
    console.log('📍 Navigating to:', userStatus.redirectPath);
    
    router.replace(userStatus.redirectPath as any);
  }
}