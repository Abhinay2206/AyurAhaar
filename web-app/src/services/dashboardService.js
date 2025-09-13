import ApiService from './api.js';

class DashboardService {
  // Get dashboard statistics for the authenticated doctor
  async getDashboardStats() {
    return ApiService.request('/doctors/doctor-portal/dashboard/stats');
  }

  // Get recent activities for the dashboard
  async getRecentActivities() {
    return ApiService.request('/doctors/doctor-portal/dashboard/recent-activities');
  }

  // Combined search for patients and appointments
  async searchDashboard(query, limit = 10) {
    return ApiService.request(`/doctors/doctor-portal/dashboard/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Get doctor profile
  async getDoctorProfile() {
    return ApiService.request('/doctors/doctor-portal/profile');
  }

  // Update doctor profile
  async updateDoctorProfile(profileData) {
    return ApiService.request('/doctors/doctor-portal/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }
}

export default new DashboardService();