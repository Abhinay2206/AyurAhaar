import ApiService from './api.js';

class DashboardService {
  // Get dashboard statistics for the authenticated doctor
  async getDashboardStats() {
    try {
      console.log('🔍 DashboardService: Fetching dashboard stats...');
      const response = await ApiService.getDashboardStats();
      console.log('📊 DashboardService: Stats response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ DashboardService: Error fetching stats:', error);
      throw error;
    }
  }

  // Get recent activities for the dashboard
  async getRecentActivities(limit = 5) {
    try {
      console.log('🔍 DashboardService: Fetching recent activities...');
      const response = await ApiService.getRecentActivities(limit);
      console.log('📋 DashboardService: Activities response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ DashboardService: Error fetching activities:', error);
      throw error;
    }
  }

  // Combined search for patients and appointments
  async searchDashboard(query, limit = 10) {
    try {
      console.log('🔍 DashboardService: Searching dashboard for:', query);
      const response = await ApiService.searchDashboard(query, limit);
      console.log('🔎 DashboardService: Search response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ DashboardService: Error searching dashboard:', error);
      throw error;
    }
  }

  // Get notifications
  async getNotifications() {
    try {
      console.log('🔍 DashboardService: Fetching notifications...');
      const response = await ApiService.getNotifications();
      console.log('🔔 DashboardService: Notifications response:', response);
      return response.success ? response.data : response;
    } catch (error) {
      console.error('❌ DashboardService: Error fetching notifications:', error);
      throw error;
    }
  }

  // Get doctor profile (fallback to existing endpoint)
  async getDoctorProfile() {
    return ApiService.request('/doctors/doctor-portal/profile');
  }

  // Update doctor profile (fallback to existing endpoint)
  async updateDoctorProfile(profileData) {
    return ApiService.request('/doctors/doctor-portal/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
}

export default new DashboardService();