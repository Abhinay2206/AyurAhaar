import { getApiBaseUrl, ApiResponse } from './api';

export interface Food {
  _id: string;
  food_id: string;
  name_en: string;
  vernacular_names?: string;
  category?: string;
  calories_kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  fiber_g?: number;
  vitamins?: string;
  minerals?: string;
  ayurveda_dosha_vata?: string;
  ayurveda_dosha_pitta?: string;
  ayurveda_dosha_kapha?: string;
  ayurveda_rasa?: string;
  ayurveda_guna?: string;
  ayurveda_virya?: string;
  ayurveda_vipaka?: string;
  health_tags?: string;
  medical_usage?: string;
  contraindications?: string;
  drug_interactions?: string;
  therapeutic_dosage?: string;
  preparation_methods?: string;
  restrictions?: string;
  growing_regions?: string;
  storage_shelf_life?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodsResponse {
  foods: Food[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FoodFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  dosha?: 'vata' | 'pitta' | 'kapha';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class FoodService {
  private static buildQueryParams(filters: FoodFilters): string {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.dosha) params.append('dosha', filters.dosha);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    return params.toString();
  }

  static async getAllFoods(filters: FoodFilters = {}): Promise<ApiResponse<FoodsResponse>> {
    try {
      const apiUrl = getApiBaseUrl();
      const queryParams = this.buildQueryParams(filters);
      const url = `${apiUrl}/foods${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch foods' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Get all foods error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  static async getFoodById(id: string): Promise<ApiResponse<Food>> {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/foods/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch food' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Get food by ID error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  static async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/foods/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch categories' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Get categories error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  static async getFoodsByDosha(dosha: 'vata' | 'pitta' | 'kapha', limit: number = 20): Promise<ApiResponse<Food[]>> {
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/foods/dosha/${dosha}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch foods by dosha' };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Get foods by dosha error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  // Helper method to format nutrition information
  static formatNutrition(food: Food): string {
    const nutrition = [];
    if (food.calories_kcal) nutrition.push(`${food.calories_kcal} kcal`);
    if (food.protein_g) nutrition.push(`${food.protein_g}g protein`);
    if (food.carbs_g) nutrition.push(`${food.carbs_g}g carbs`);
    if (food.fats_g) nutrition.push(`${food.fats_g}g fats`);
    return nutrition.join(' • ');
  }

  // Helper method to get dosha compatibility
  static getDoshaCompatibility(food: Food): { vata: string; pitta: string; kapha: string } {
    return {
      vata: food.ayurveda_dosha_vata || 'Unknown',
      pitta: food.ayurveda_dosha_pitta || 'Unknown',
      kapha: food.ayurveda_dosha_kapha || 'Unknown'
    };
  }

  // Helper method to parse health tags
  static getHealthTags(food: Food): string[] {
    if (!food.health_tags) return [];
    return food.health_tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
}