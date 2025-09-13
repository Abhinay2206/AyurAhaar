// Appointment service for handling appointment-related API calls
import { getApiBaseUrl } from './api';

export interface AppointmentData {
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  consultationFee: number;
  date: string;
  time: string;
  patientDetails: {
    name: string;
    email: string;
    phone: string;
    age: string;
    gender: string;
    emergencyContact?: string;
  };
  consultationDetails: {
    type: string;
    symptoms: string;
    medicalHistory?: string;
    currentMedications?: string;
    allergies?: string;
    lifestyle?: string;
    weight?: string;
    height?: string;
  };
  paymentMethod: string;
  paymentStatus?: string;
  appointmentId?: string;
}

export interface Appointment extends AppointmentData {
  _id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  dietPlan?: {
    isVisible: boolean;
    plan?: string;
    recommendations?: string[];
    restrictions?: string[];
  };
  doctorNotes?: string;
  prescription?: string;
}

export class AppointmentService {
  static async createAppointment(appointmentData: AppointmentData): Promise<Appointment> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/appointments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to create appointment');
      }

      return result.appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  static async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/appointments/patient/${patientId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch appointments');
      }

      return result.appointments;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  }

  static async getAppointmentById(appointmentId: string): Promise<Appointment> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/appointments/${appointmentId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch appointment');
      }

      return result.appointment;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  }

  static async updateAppointmentStatus(
    appointmentId: string, 
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<Appointment> {
    try {
      const response = await fetch(`${getApiBaseUrl()}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update appointment status');
      }

      return result.appointment;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  static async cancelAppointment(appointmentId: string): Promise<Appointment> {
    return this.updateAppointmentStatus(appointmentId, 'cancelled');
  }

  static async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<Appointment> {
    try {
      // Note: This endpoint would need to be implemented in the backend
      const response = await fetch(`${getApiBaseUrl()}/appointments/${appointmentId}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: newDate, time: newTime }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to reschedule appointment');
      }

      return result.appointment;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  // Mock service methods for demo purposes (when backend is not available)
  static async createAppointmentMock(appointmentData: AppointmentData): Promise<Appointment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockAppointment: Appointment = {
      ...appointmentData,
      _id: `mock_${Date.now()}`,
      appointmentId: appointmentData.appointmentId || `APT${Date.now()}`,
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dietPlan: {
        isVisible: false, // Diet plan is hidden until appointment is completed
      },
    };

    // Store in local storage for demo
    this.storeAppointmentLocally(mockAppointment);

    return mockAppointment;
  }

  static async getPatientAppointmentsMock(patientId: string): Promise<Appointment[]> {
    // Get appointments from local storage
    const appointments = this.getAppointmentsFromLocalStorage();
    return appointments.filter(apt => apt.patientId === patientId);
  }

  private static storeAppointmentLocally(appointment: Appointment): void {
    try {
      const existingAppointments = this.getAppointmentsFromLocalStorage();
      existingAppointments.push(appointment);
      localStorage.setItem('ayurahaar_appointments', JSON.stringify(existingAppointments));
    } catch (error) {
      console.warn('Failed to store appointment locally:', error);
    }
  }

  private static getAppointmentsFromLocalStorage(): Appointment[] {
    try {
      const stored = localStorage.getItem('ayurahaar_appointments');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to get appointments from local storage:', error);
      return [];
    }
  }
}