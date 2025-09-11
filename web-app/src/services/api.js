// API Service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
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
