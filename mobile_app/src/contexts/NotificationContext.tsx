import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService, { NotificationPreferences } from '../services/notification';

interface NotificationContextType {
  // Service instance
  notificationService: NotificationService;
  
  // State
  isInitialized: boolean;
  hasPermissions: boolean;
  preferences: NotificationPreferences;
  pushToken: string | null;
  lastNotification: Notifications.Notification | null;
  
  // Actions
  requestPermissions: () => Promise<boolean>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<string | null>;
  scheduleAppointmentReminder: (appointmentId: string, appointmentDate: Date, doctorName: string) => Promise<string | null>;
  schedulePlanReminder: (planId: string, reminderTime: Date, message: string) => Promise<string | null>;
  scheduleMedicationReminder: (medicationName: string, time: Date) => Promise<string | null>;
  cancelNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationService] = useState(() => NotificationService.getInstance());
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    appointments: true,
    plans: true,
    reminders: true,
    marketing: false,
    sound: true,
    vibration: true,
  });
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const { notification, actionIdentifier } = response;
      const data = notification.request.content.data;

      console.log('Handling notification response:', { actionIdentifier, data });

      // Handle different types of notification responses
      switch (data.type) {
        case 'appointment':
          handleAppointmentNotificationResponse(actionIdentifier, data);
          break;
        case 'plan':
          handlePlanNotificationResponse(actionIdentifier, data);
          break;
        case 'medication':
          handleMedicationNotificationResponse(actionIdentifier, data);
          break;
        default:
          console.log('Unknown notification type:', data.type);
      }
    };

    const initializeNotificationService = async () => {
      try {
        console.log('Initializing notification service...');
        
        // Initialize the service
        await notificationService.initialize();
        
        // Load current preferences
        const currentPreferences = await notificationService.getPreferences();
        setPreferences(currentPreferences);
        
        // Get push token
        const token = notificationService.getPushToken();
        setPushToken(token);
        
        // Check permissions
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermissions(status === 'granted');
        
        setIsInitialized(true);
        console.log('Notification service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    };

    const setupNotificationListeners = () => {
      // Listen for notifications received while app is foregrounded
      const foregroundSubscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification received in foreground:', notification);
          setLastNotification(notification);
        }
      );

      // Listen for notification responses (user interactions)
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log('Notification response received:', response);
          handleNotificationResponse(response);
        }
      );

      return () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      };
    };

    initializeNotificationService();
    const cleanup = setupNotificationListeners();
    
    return cleanup;
  }, [notificationService]);

  const handleAppointmentNotificationResponse = (actionIdentifier: string, data: any) => {
    switch (actionIdentifier) {
      case 'view':
        // Navigate to appointment details
        console.log('Navigate to appointment:', data.appointmentId);
        break;
      case 'reschedule':
        // Navigate to reschedule screen
        console.log('Navigate to reschedule appointment:', data.appointmentId);
        break;
      default:
        // Default action (tap notification)
        console.log('Open appointment details:', data.appointmentId);
    }
  };

  const handlePlanNotificationResponse = (actionIdentifier: string, data: any) => {
    switch (actionIdentifier) {
      case 'view':
        // Navigate to plan details
        console.log('Navigate to plan:', data.planId);
        break;
      default:
        // Default action (tap notification)
        console.log('Open plan details:', data.planId);
    }
  };

  const handleMedicationNotificationResponse = (actionIdentifier: string, data: any) => {
    switch (actionIdentifier) {
      case 'done':
        // Mark medication as taken
        console.log('Mark medication as taken:', data.medicationName);
        break;
      case 'snooze':
        // Snooze the reminder
        console.log('Snooze medication reminder:', data.medicationName);
        break;
      default:
        // Default action (tap notification)
        console.log('Open medication details:', data.medicationName);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermissions();
    setHasPermissions(granted);
    return granted;
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>): Promise<void> => {
    await notificationService.updatePreferences(newPreferences);
    const updatedPreferences = await notificationService.getPreferences();
    setPreferences(updatedPreferences);
  };

  const sendLocalNotification = async (title: string, body: string, data?: any): Promise<string | null> => {
    return await notificationService.sendLocalNotification({
      id: `local_${Date.now()}`,
      title,
      body,
      data,
      // Don't include badge property if not needed to avoid undefined issues
    });
  };

  const scheduleAppointmentReminder = async (
    appointmentId: string,
    appointmentDate: Date,
    doctorName: string
  ): Promise<string | null> => {
    return await notificationService.scheduleAppointmentReminder(appointmentId, appointmentDate, doctorName);
  };

  const schedulePlanReminder = async (
    planId: string,
    reminderTime: Date,
    message: string
  ): Promise<string | null> => {
    return await notificationService.schedulePlanReminder(planId, reminderTime, message);
  };

  const scheduleMedicationReminder = async (
    medicationName: string,
    time: Date
  ): Promise<string | null> => {
    return await notificationService.scheduleMedicationReminder(medicationName, time);
  };

  const cancelNotification = async (notificationId: string): Promise<void> => {
    await notificationService.cancelNotification(notificationId);
  };

  const clearAllNotifications = async (): Promise<void> => {
    await notificationService.cancelAllNotifications();
  };

  const contextValue: NotificationContextType = {
    notificationService,
    isInitialized,
    hasPermissions,
    preferences,
    pushToken,
    lastNotification,
    requestPermissions,
    updatePreferences,
    sendLocalNotification,
    scheduleAppointmentReminder,
    schedulePlanReminder,
    scheduleMedicationReminder,
    cancelNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;