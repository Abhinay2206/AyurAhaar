import ApiService from './api.js';

class MealPlanService {
  // Get all meal plans for the authenticated doctor
  async getMealPlans(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return ApiService.request(`/doctors/doctor-portal/meal-plans${queryParams ? `?${queryParams}` : ''}`);
  }

  // Get a specific meal plan
  async getMealPlan(planId) {
    return ApiService.request(`/plans/${planId}`);
  }

  // Create a custom meal plan
  async createMealPlan(planData) {
    return ApiService.request('/doctors/doctor-portal/meal-plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  }

  // Generate AI meal plan
  async generateAIMealPlan(patientId, preferences = {}) {
    return ApiService.request('/plans/generate-ai', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        preferences
      })
    });
  }

  // Update meal plan
  async updateMealPlan(planId, planData) {
    return ApiService.request(`/plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(planData)
    });
  }

  // Approve a meal plan
  async approveMealPlan(planId) {
    return ApiService.request(`/plans/${planId}/approve`, {
      method: 'POST'
    });
  }

  // Reject a meal plan
  async rejectMealPlan(planId, reason) {
    return ApiService.request(`/plans/${planId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Get meal plan templates
  async getMealPlanTemplates() {
    return ApiService.request('/plans/templates');
  }

  // Clone a meal plan for another patient
  async cloneMealPlan(planId, newPatientId) {
    return ApiService.request(`/plans/${planId}/clone`, {
      method: 'POST',
      body: JSON.stringify({ patientId: newPatientId })
    });
  }

  // Get meal plan statistics
  async getMealPlanStats() {
    return ApiService.request('/plans/stats');
  }

  // Get patient's current meal plan
  async getPatientCurrentPlan(patientId) {
    return ApiService.request(`/plans/patient/${patientId}/current`);
  }

  // Assign meal plan to patient
  async assignPlanToPatient(planId, patientId) {
    return ApiService.request(`/plans/${planId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ patientId })
    });
  }

  // Get meal plan progress
  async getMealPlanProgress(planId) {
    return ApiService.request(`/plans/${planId}/progress`);
  }

  // Update meal plan progress
  async updateMealPlanProgress(planId, progressData) {
    return ApiService.request(`/plans/${planId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData)
    });
  }

  // Get food recommendations based on Prakriti
  async getFoodRecommendations(constitution, restrictions = []) {
    return ApiService.request(`/foods/recommendations`, {
      method: 'POST',
      body: JSON.stringify({ constitution, restrictions })
    });
  }

  // Search foods
  async searchFoods(query) {
    return ApiService.request(`/foods/search?q=${encodeURIComponent(query)}`);
  }

  // Get food details
  async getFoodDetails(foodId) {
    return ApiService.request(`/foods/${foodId}`);
  }
}

export default new MealPlanService();