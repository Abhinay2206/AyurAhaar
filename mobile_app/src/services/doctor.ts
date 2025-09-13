import { getApiBaseUrl } from './api';

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  licenseNumber: string;
  experience?: number;
  location?: string;
  consultationFee?: number;
  patients?: string[];
  appointments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export class DoctorService {
  static async getAllDoctors(): Promise<Doctor[]> {
    try {
      const baseUrl = await getApiBaseUrl();
      console.log('🔗 API Base URL:', baseUrl);
      
      // First, let's test if the server is reachable
      console.log('🧪 Testing server connectivity...');
      try {
        const healthResponse = await fetch(`${baseUrl.replace('/api', '')}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (healthResponse.ok) {
          console.log('✅ Server is reachable');
        } else {
          console.log('⚠️ Server responded but with error status:', healthResponse.status);
        }
      } catch (healthError) {
        console.log('❌ Health check failed:', healthError);
        throw new Error('Cannot connect to backend server. Please ensure the server is running.');
      }
      
      const fullUrl = `${baseUrl}/doctors`;
      console.log('📡 Fetching doctors from:', fullUrl);
      
      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Response data:', data);
      
      return data.doctors || [];
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please check your internet connection and try again.');
        } else if (error.message.includes('Network request failed')) {
          throw new Error('Unable to connect to server. Please make sure the backend server is running at the correct IP address.');
        } else if (error.message.includes('Cannot connect to backend server')) {
          throw error; // Already a user-friendly message
        } else {
          throw error;
        }
      } else {
        throw new Error('An unexpected error occurred while fetching doctors.');
      }
    }
  }

  static async getDoctorsByLocation(location: string): Promise<Doctor[]> {
    try {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/doctors/search?location=${encodeURIComponent(location)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.doctors || [];
    } catch (error) {
      console.error('Error fetching doctors by location:', error);
      throw error;
    }
  }

  static async findNearbyDoctors(coordinates: LocationCoordinates): Promise<Doctor[]> {
    try {
      console.log('🌍 Finding nearby doctors for coordinates:', coordinates);
      
      // First, try to get user's current city based on coordinates
      const userCity = await this.getCityFromCoordinates(coordinates);
      console.log('🏙️ User city:', userCity);
      
      if (userCity) {
        // Search for doctors in the user's city
        const nearbyDoctors = await this.getDoctorsByLocation(userCity);
        console.log(`🏥 Found ${nearbyDoctors.length} doctors in ${userCity}`);
        
        if (nearbyDoctors.length > 0) {
          return nearbyDoctors;
        }
      }

      // If no doctors found nearby, get all doctors and return them
      console.log('🔄 No nearby doctors found, fetching all doctors...');
      const allDoctors = await this.getAllDoctors();
      console.log(`🏥 Total doctors available: ${allDoctors.length}`);
      
      // Filter doctors from Hyderabad as fallback (as per the original requirement)
      const hyderabadDoctors = allDoctors.filter(doctor => 
        doctor.location && doctor.location.toLowerCase().includes('hyderabad')
      );
      console.log(`🏥 Hyderabad doctors: ${hyderabadDoctors.length}`);

      return hyderabadDoctors.length > 0 ? hyderabadDoctors : allDoctors;
    } catch (error) {
      console.error('❌ Error finding nearby doctors:', error);
      // Fallback to all doctors
      try {
        console.log('🔄 Fallback: trying to get all doctors...');
        return await this.getAllDoctors();
      } catch (fallbackError) {
        console.error('❌ Error in fallback doctor fetch:', fallbackError);
        return [];
      }
    }
  }

  private static async getCityFromCoordinates(coordinates: LocationCoordinates): Promise<string | null> {
    try {
      // In a real implementation, you would use a reverse geocoding service
      // For now, we'll use a simple mock implementation
      
      // This is a placeholder - in production, use Google Maps API or similar
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&localityLanguage=en`
      );

      if (response.ok) {
        const data = await response.json();
        return data.city || data.locality || null;
      }

      return null;
    } catch (error) {
      console.error('Error getting city from coordinates:', error);
      return null;
    }
  }

  static async getDoctorById(doctorId: string): Promise<Doctor | null> {
    try {
      const baseUrl = await getApiBaseUrl();
      const response = await fetch(`${baseUrl}/doctors/${doctorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.doctor || null;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      throw error;
    }
  }
}