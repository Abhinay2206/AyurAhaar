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

  async createMealPlan(mealPlanData) {
    console.log('🌐 ApiService: Calling POST /meal-plans');
    return this.request('/meal-plans', {
      method: 'POST',
      body: JSON.stringify(mealPlanData),
    });
  }

  async updateMealPlan(planId, mealPlanData) {
    console.log('🌐 ApiService: Calling PUT /meal-plans/' + planId);
    return this.request(`/meal-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(mealPlanData),
    });
  }

  async getPatientMealPlans(patientId) {
    console.log('🌐 ApiService: Calling GET /meal-plans/patient/' + patientId);
    return this.request(`/meal-plans/patient/${patientId}`);
  }

  async getMealPlanById(planId) {
    console.log('🌐 ApiService: Calling GET /meal-plans/' + planId);
    return this.request(`/meal-plans/${planId}`);
  }

  async deleteMealPlan(planId) {
    console.log('🌐 ApiService: Calling DELETE /meal-plans/' + planId);
    return this.request(`/meal-plans/${planId}`, {
      method: 'DELETE',
    });
  }

  async approveMealPlan(id) {
    return this.request(`/meal-plans/${id}/approve`, {
      method: 'POST',
    });
  }

  // Patient management endpoints
  async getAllPatients(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/admin/patients${queryString ? `?${queryString}` : ''}`;
    
    console.log('🌐 ApiService: Calling GET', endpoint);
    return this.request(endpoint);
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

  // Consultation/Appointment endpoints
  async getAllConsultations(filters = {}) {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/admin/appointments?${queryString}` : '/admin/appointments';
    
    console.log('🌐 ApiService: Calling GET', url);
    return this.request(url);
  }

  async getAppointmentById(id) {
    console.log('🌐 ApiService: Calling GET /appointments/' + id);
    return this.request(`/appointments/${id}`);
  }

  async rescheduleAppointment(id, data) {
    console.log('🌐 ApiService: Calling PUT /appointments/' + id + '/reschedule');
    return this.request(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(id, status) {
    console.log('🌐 ApiService: Calling PUT /appointments/' + id + '/status');
    return this.request(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateAppointmentNotes(id, notes) {
    console.log('🌐 ApiService: Calling PUT /appointments/' + id + '/notes');
    return this.request(`/appointments/${id}/notes`, {
      method: 'PUT',
      body: JSON.stringify(notes),
    });
  }

  async createConsultation(data) {
    console.log('🌐 ApiService: Calling POST /appointments/create');
    return this.request('/appointments/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Patient detail endpoints
  async getPatientById(patientId) {
    console.log('🌐 ApiService: Calling GET /admin/patients/' + patientId);
    return this.request(`/admin/patients/${patientId}`);
  }

  async getPatientSurveyData(patientId) {
    console.log('🌐 ApiService: Calling GET /admin/patients/' + patientId + '/survey');
    return this.request(`/admin/patients/${patientId}/survey`);
  }

  async getPatientPrakritiData(patientId) {
    console.log('🌐 ApiService: Calling GET /admin/patients/' + patientId + '/prakriti');
    return this.request(`/admin/patients/${patientId}/prakriti`);
  }

  // Treatment Plan endpoints
  async getAllTreatmentPlans(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/treatment-plans${queryParams ? '?' + queryParams : ''}`;
    console.log('🌐 ApiService: Calling GET ' + url);
    return this.request(url);
  }

  async getTreatmentPlanById(planId) {
    console.log('🌐 ApiService: Calling GET /treatment-plans/' + planId);
    return this.request(`/treatment-plans/${planId}`);
  }

  async getPatientTreatmentPlans(patientId, status = '') {
    const url = `/treatment-plans/patient/${patientId}${status ? '?status=' + status : ''}`;
    console.log('🌐 ApiService: Calling GET ' + url);
    return this.request(url);
  }

  async getPatientsWithConsultations(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/treatment-plans/patients${queryParams ? '?' + queryParams : ''}`;
    console.log('🌐 ApiService: Calling GET ' + url);
    return this.request(url);
  }

  async createTreatmentPlan(planData) {
    console.log('🌐 ApiService: Calling POST /treatment-plans');
    return this.request('/treatment-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateTreatmentPlan(planId, updateData) {
    console.log('🌐 ApiService: Calling PUT /treatment-plans/' + planId);
    return this.request(`/treatment-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteTreatmentPlan(planId) {
    console.log('🌐 ApiService: Calling DELETE /treatment-plans/' + planId);
    return this.request(`/treatment-plans/${planId}`, {
      method: 'DELETE',
    });
  }

  async approveTreatmentPlan(planId, doctorId) {
    console.log('🌐 ApiService: Calling PUT /treatment-plans/' + planId + '/approve');
    return this.request(`/treatment-plans/${planId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ doctorId }),
    });
  }

  // Consultation management
  async startConsultation(patientId) {
    console.log('🌐 ApiService: Calling POST /treatment-plans/consultation/' + patientId + '/start');
    return this.request(`/treatment-plans/consultation/${patientId}/start`, {
      method: 'POST',
    });
  }

  async completeConsultation(patientId) {
    console.log('🌐 ApiService: Calling PUT /treatment-plans/consultation/' + patientId + '/complete');
    return this.request(`/treatment-plans/consultation/${patientId}/complete`, {
      method: 'PUT',
    });
  }

  // Food endpoints
  async getAllFoods(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/foods${queryParams ? '?' + queryParams : ''}`;
    console.log('🌐 ApiService: Calling GET ' + url);
    return this.request(url);
  }

  async getFoodsByCategory(category, filters = {}) {
    const queryParams = new URLSearchParams({ ...filters, category }).toString();
    const url = `/foods${queryParams ? '?' + queryParams : ''}`;
    console.log('🌐 ApiService: Calling GET ' + url + ' (category: ' + category + ')');
    return this.request(url);
  }

  async getFoodCategories() {
    console.log('🌐 ApiService: Calling GET /foods/categories');
    return this.request('/foods/categories');
  }

  async getFoodById(foodId) {
    console.log('🌐 ApiService: Calling GET /foods/' + foodId);
    return this.request(`/foods/${foodId}`);
  }
}

export default new ApiService();
