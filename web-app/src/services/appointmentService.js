import ApiService from './api.js';

class AppointmentService {
  // Get all appointments for the authenticated doctor with enhanced search
  async getAppointments(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return ApiService.request(`/doctors/doctor-portal/appointments${queryParams ? `?${queryParams}` : ''}`);
  }

  // Search appointments with advanced filters
  async searchAppointments(searchQuery, options = {}) {
    const { page = 1, limit = 10, status, date } = options;
    
    const params = new URLSearchParams({
      search: searchQuery,
      page,
      limit
    });
    
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    
    return ApiService.request(`/doctors/doctor-portal/appointments?${params.toString()}`);
  }

  // Get appointments for a specific date
  async getAppointmentsByDate(date) {
    return ApiService.request(`/doctors/doctor-portal/appointments?date=${date}`);
  }

  // Get today's appointments
  async getTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsByDate(today);
  }

  // Get upcoming appointments
  async getUpcomingAppointments(limit = 10) {
    return ApiService.request(`/doctors/doctor-portal/appointments?limit=${limit}&status=scheduled,confirmed`);
  }

  // Get a specific appointment
  async getAppointment(appointmentId) {
    return ApiService.request(`/appointments/${appointmentId}`);
  }

  // Create a new appointment
  async createAppointment(appointmentData) {
    return ApiService.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  }

  // Update appointment
  async updateAppointment(appointmentId, appointmentData) {
    return ApiService.request(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
  }

  // Update appointment status (doctor-specific)
  async updateAppointmentStatus(appointmentId, status) {
    return ApiService.request(`/doctors/doctor-portal/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Cancel appointment
  async cancelAppointment(appointmentId) {
    return this.updateAppointmentStatus(appointmentId, 'cancelled');
  }

  // Confirm appointment
  async confirmAppointment(appointmentId) {
    return this.updateAppointmentStatus(appointmentId, 'confirmed');
  }

  // Complete appointment
  async completeAppointment(appointmentId) {
    return this.updateAppointmentStatus(appointmentId, 'completed');
  }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newDateTime) {
    return ApiService.request(`/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ newDateTime })
    });
  }

  // Get available time slots for a doctor
  async getAvailableSlots(doctorId, date) {
    return ApiService.request(`/appointments/slots?doctorId=${doctorId}&date=${date}`);
  }

  // Get appointment statistics
  async getAppointmentStats() {
    return ApiService.request('/appointments/stats');
  }
}

export default new AppointmentService();