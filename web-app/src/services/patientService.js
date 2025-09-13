import ApiService from './api.js';

class PatientService {
  // Get all patients for the authenticated doctor with enhanced search
  async getPatients(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return ApiService.request(`/doctors/doctor-portal/patients${queryParams ? `?${queryParams}` : ''}`);
  }

  // Search patients with advanced filters
  async searchPatients(searchQuery, options = {}) {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const params = new URLSearchParams({
      search: searchQuery,
      page,
      limit,
      sortBy,
      sortOrder
    });
    
    if (status) params.append('status', status);
    
    return ApiService.request(`/doctors/doctor-portal/patients?${params.toString()}`);
  }

  // Get a specific patient by ID (must be assigned to the doctor)
  async getPatient(patientId) {
    return ApiService.request(`/doctors/doctor-portal/patients/${patientId}`);
  }

  // Create a new patient
  async createPatient(patientData) {
    return ApiService.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  }

  // Update patient information
  async updatePatient(patientId, patientData) {
    return ApiService.request(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
  }

  // Get patient dashboard data
  async getPatientDashboard(patientId) {
    return ApiService.request(`/doctors/doctor-portal/patients/${patientId}/dashboard`);
  }

  // Get patient's meal plans
  async getPatientMealPlans(patientId) {
    return ApiService.request(`/doctors/doctor-portal/meal-plans?patientId=${patientId}`);
  }

  // Get patient's appointments
  async getPatientAppointments(patientId) {
    return ApiService.request(`/patients/${patientId}/appointments`);
  }

  // Get patient's health assessments
  async getPatientAssessments(patientId) {
    return ApiService.request(`/patients/${patientId}/assessments`);
  }

  // Update patient's Prakriti assessment
  async updatePrakriti(patientId, prakritiData) {
    return ApiService.request(`/patients/${patientId}/prakriti`, {
      method: 'POST',
      body: JSON.stringify(prakritiData)
    });
  }

  // Get patient statistics for dashboard
  async getPatientStats() {
    return ApiService.request('/patients/stats');
  }
}

export default new PatientService();