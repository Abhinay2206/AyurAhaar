// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiService {
  getAuthHeaders() {
    const token = localStorage.getItem('ayur_ahaar_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('ayur_ahaar_token');
        localStorage.removeItem('ayur_ahaar_user');
        window.location.href = '/login';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Auth endpoints
  async loginDoctor(credentials) {
    return this.request('/auth/doctor/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async loginAdmin(credentials) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerDoctor(doctorData) {
    return this.request('/auth/doctor/register', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Patient endpoints
  async getPatients() {
    return this.request('/patients');
  }

  async getPatient(id) {
    return this.request(`/patients/${id}`);
  }

  // Appointment endpoints
  async getAppointments() {
    return this.request('/appointments');
  }

  async createAppointment(appointment) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  // Meal plan endpoints
  async getMealPlans() {
    return this.request('/meal-plans');
  }

  async approveMealPlan(id) {
    return this.request(`/meal-plans/${id}/approve`, {
      method: 'POST',
    });
  }
}

export default new ApiService();
