import AuthService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class PrescriptionService {
  static async getAllPrescriptions() {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  }

  static async getPrescriptionById(id) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  }

  static async createPrescription(prescriptionData) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  static async updatePrescription(id, prescriptionData) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prescriptionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  }

  static async deletePrescription(id) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  }

  static async renewPrescription(id) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error renewing prescription:', error);
      throw error;
    }
  }

  static async printPrescription(id) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/${id}/print`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Prescription downloaded successfully' };
    } catch (error) {
      console.error('Error printing prescription:', error);
      throw error;
    }
  }

  static async getPrescriptionsByPatient(patientId) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/patient/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      throw error;
    }
  }

  static async searchPrescriptions(searchTerm) {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching prescriptions:', error);
      throw error;
    }
  }

  static async getPrescriptionStats() {
    try {
      const token = AuthService.getToken();
      const response = await fetch(`${API_BASE_URL}/prescriptions/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching prescription stats:', error);
      throw error;
    }
  }
}

export { PrescriptionService };