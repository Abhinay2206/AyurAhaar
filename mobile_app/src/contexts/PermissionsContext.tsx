import React, { createContext, useContext, useEffect, useState } from 'react';
import { PermissionsService, PermissionsStatus } from '../services/permissions';

interface PermissionsContextType {
  permissions: PermissionsStatus;
  isLoading: boolean;
  requestPermissions: () => Promise<void>;
  resetPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: React.ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [permissions, setPermissions] = useState<PermissionsStatus>({
    location: false,
    mediaLibrary: false,
    contacts: false,
    allGranted: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    try {
      setIsLoading(true);
      
      // Check current permissions status
      const currentStatus = await PermissionsService.checkAllPermissions();
      setPermissions(currentStatus);

      // If not all permissions are granted, request them
      if (!currentStatus.allGranted) {
        const newStatus = await PermissionsService.requestAllPermissions();
        setPermissions(newStatus);
      }
    } catch (error) {
      console.error('Error initializing permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const newStatus = await PermissionsService.requestAllPermissions();
      setPermissions(newStatus);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const resetPermissions = async () => {
    try {
      await PermissionsService.resetPermissions();
      await initializePermissions();
    } catch (error) {
      console.error('Error resetting permissions:', error);
    }
  };

  const value: PermissionsContextType = {
    permissions,
    isLoading,
    requestPermissions,
    resetPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}