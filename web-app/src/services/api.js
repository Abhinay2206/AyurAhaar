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

    console.log('🌐 ApiService: Making request to:', url);
    console.log('🔑 ApiService: Auth headers:', this.getAuthHeaders());

    const response = await fetch(url, config);
    
    console.log('📡 ApiService: Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('🚫 ApiService: Unauthorized - redirecting to login');
        // Token expired or invalid, redirect to login
        localStorage.removeItem('ayur_ahaar_token');
        localStorage.removeItem('ayur_ahaar_user');
        window.location.href = '/login';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 ApiService: Response data:', data);
    return data;
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

  async loginSuperAdmin(credentials) {
    return this.request('/auth/super-admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Universal login - try to login with any role
  async loginUniversal(credentials) {
    return this.request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
        // Don't send role to let backend determine it
      }),
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

  // Dashboard endpoints
  async getDashboardStats() {
    console.log('🌐 ApiService: Calling GET /dashboard/stats');
    return this.request('/dashboard/stats');
  }

  async getRecentActivities(limit = 5) {
    console.log('🌐 ApiService: Calling GET /dashboard/recent-activities with limit:', limit);
    return this.request(`/dashboard/recent-activities?limit=${limit}`);
  }

  async searchDashboard(query, limit = 10) {
    const encodedQuery = encodeURIComponent(query);
    console.log('🌐 ApiService: Calling GET /dashboard/search with query:', query);
    return this.request(`/dashboard/search?query=${encodedQuery}&limit=${limit}`);
  }

  async getNotifications() {
    console.log('🌐 ApiService: Calling GET /dashboard/notifications');
    return this.request('/dashboard/notifications');
  }
}

export default new ApiService();
