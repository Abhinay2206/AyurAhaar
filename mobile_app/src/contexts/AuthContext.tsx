import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationUtils } from '@/src/utils/navigation';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  constitution?: string;
  surveyCompleted: boolean;
}

interface AuthContextType {
  patient: Patient | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (patientData: Patient) => Promise<void>;
  logout: () => Promise<void>;
  updatePatient: (updates: Partial<Patient>) => Promise<void>;
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PATIENT_DATA: '@patient_data',
  AUTH_TOKEN: '@auth_token',
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuthData();
  }, []);

  const loadStoredAuthData = async () => {
    try {
      const [storedPatient, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PATIENT_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
      ]);

      if (storedPatient && storedToken) {
        setPatient(JSON.parse(storedPatient));
      }
    } catch (error) {
      console.error('Error loading stored auth data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (patientData: Patient) => {
    try {
      setPatient(patientData);
      await AsyncStorage.setItem(STORAGE_KEYS.PATIENT_DATA, JSON.stringify(patientData));
    } catch (error) {
      console.error('Error storing patient data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setPatient(null);
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.PATIENT_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
      ]);
      
      // Use force reset to ensure complete navigation stack reset
      await NavigationUtils.forceResetToRoute('/home');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const updatePatient = async (updates: Partial<Patient>) => {
    try {
      if (!patient) throw new Error('No patient logged in');
      
      const updatedPatient = { ...patient, ...updates };
      setPatient(updatedPatient);
      await AsyncStorage.setItem(STORAGE_KEYS.PATIENT_DATA, JSON.stringify(updatedPatient));
    } catch (error) {
      console.error('Error updating patient data:', error);
      throw error;
    }
  };

  const getToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const setToken = async (token: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    patient,
    isLoading,
    isAuthenticated: !!patient,
    login,
    logout,
    updatePatient,
    getToken,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { Patient };