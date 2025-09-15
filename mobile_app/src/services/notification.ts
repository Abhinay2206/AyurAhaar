import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  categoryId?: string;
  badge?: number;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  trigger: Notifications.NotificationTriggerInput;
  data?: any;
}

export interface NotificationPreferences {
  enabled: boolean;
  appointments: boolean;
  plans: boolean;
  reminders: boolean;
  marketing: boolean;
  sound: boolean;
  vibration: boolean;
}

const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';
const PUSH_TOKEN_KEY = 'push_token';

// Default notification preferences
const defaultPreferences: NotificationPreferences = {
  enabled: true,
  appointments: true,
  plans: true,
  reminders: true,
  marketing: false,
  sound: true,
  vibration: true,
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // Disable automatic badge setting to avoid nil errors
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private preferences: NotificationPreferences = defaultPreferences;

  private constructor() {
    this.loadPreferences();
    this.loadPushToken();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();
      
      // Get push token for push notifications
      await this.registerForPushNotifications();
      
      // Set up notification categories
      await this.setupNotificationCategories();
      
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied');
        return false;
      }

      // For Android, request additional permissions
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });

        // Create specific channels for different notification types
        await this.createNotificationChannels();
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Create Android notification channels
   */
  private async createNotificationChannels(): Promise<void> {
    const channels = [
      {
        id: 'appointments',
        name: 'Appointments',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Notifications for upcoming appointments',
      },
      {
        id: 'plans',
        name: 'Health Plans',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Notifications about your health plans',
      },
      {
        id: 'reminders',
        name: 'Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        description: 'Medication and health reminders',
      },
      {
        id: 'general',
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'General app notifications',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        description: channel.description,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }
  }

  /**
   * Set up notification categories for interactive notifications
   */
  private async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('appointment', [
      {
        identifier: 'view',
        buttonTitle: 'View',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'reschedule',
        buttonTitle: 'Reschedule',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('reminder', [
      {
        identifier: 'done',
        buttonTitle: 'Mark Done',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze',
        options: { opensAppToForeground: false },
      },
    ]);
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        // projectId can be undefined for development/testing
        // Replace with your actual project ID for production push notifications
        // projectId: 'your-expo-project-id',
      });

      this.pushToken = token.data;
      await this.savePushToken(token.data);
      
      console.log('Push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Send a local notification
   */
  async sendLocalNotification(notification: NotificationData): Promise<string | null> {
    try {
      console.log('DEBUG: sendLocalNotification called with:', notification);
      
      const preferences = await this.getPreferences();
      
      if (!preferences.enabled) {
        console.log('Notifications are disabled');
        return null;
      }

      const notificationContent: any = {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      };

      // Only set sound if enabled in preferences
      if (preferences.sound) {
        notificationContent.sound = 'default';
      }

      // Only set badge if it's a valid number
      if (typeof notification.badge === 'number' && notification.badge >= 0) {
        console.log('DEBUG: Setting badge to:', notification.badge);
        notificationContent.badge = notification.badge;
      } else {
        console.log('DEBUG: Badge not set, value was:', notification.badge, 'type:', typeof notification.badge);
      }

      // Only set category if it's provided
      if (notification.categoryId) {
        notificationContent.categoryIdentifier = notification.categoryId;
      }

      console.log('DEBUG: Final notification content:', notificationContent);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Show immediately
      });

      console.log('Local notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return null;
    }
  }

  /**
   * Schedule a notification for later
   */
  async scheduleNotification(notification: ScheduledNotification): Promise<string | null> {
    try {
      const preferences = await this.getPreferences();
      
      if (!preferences.enabled) {
        console.log('Notifications are disabled');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: preferences.sound ? 'default' : undefined,
        },
        trigger: notification.trigger,
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Schedule appointment reminder
   */
  async scheduleAppointmentReminder(appointmentId: string, appointmentDate: Date, doctorName: string): Promise<string | null> {
    const preferences = await this.getPreferences();
    
    if (!preferences.appointments) {
      return null;
    }

    // Schedule notification 1 hour before appointment
    const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
    
    if (reminderTime <= new Date()) {
      console.log('Appointment time is too soon for reminder');
      return null;
    }

    // Cancel any existing notifications for this appointment first
    await this.cancelAppointmentReminders(appointmentId);

    const notificationId = await this.scheduleNotification({
      id: `appointment_${appointmentId}`,
      title: 'Upcoming Appointment',
      body: `You have an appointment with Dr. ${doctorName} in 1 hour`,
      trigger: { date: reminderTime } as Notifications.NotificationTriggerInput,
      data: { 
        type: 'appointment', 
        appointmentId,
        action: 'reminder'
      },
    });

    if (notificationId) {
      console.log(`📅 Scheduled reminder for appointment ${appointmentId}: ${notificationId}`);
    }

    return notificationId;
  }

  /**
   * Cancel all reminders for a specific appointment
   */
  async cancelAppointmentReminders(appointmentId: string): Promise<void> {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.appointmentId === appointmentId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`🗑️ Cancelled existing reminder: ${notification.identifier}`);
        }
      }
    } catch (error) {
      console.error('Failed to cancel appointment reminders:', error);
    }
  }

  /**
   * Schedule plan reminder
   */
  async schedulePlanReminder(planId: string, reminderTime: Date, message: string): Promise<string | null> {
    const preferences = await this.getPreferences();
    
    if (!preferences.plans) {
      return null;
    }

    return await this.scheduleNotification({
      id: `plan_${planId}_${Date.now()}`,
      title: 'Health Plan Reminder',
      body: message,
      trigger: { date: reminderTime } as Notifications.NotificationTriggerInput,
      data: { 
        type: 'plan', 
        planId,
        action: 'reminder'
      },
    });
  }

  /**
   * Schedule medication reminder
   */
  async scheduleMedicationReminder(medicationName: string, time: Date): Promise<string | null> {
    const preferences = await this.getPreferences();
    
    if (!preferences.reminders) {
      return null;
    }

    return await this.scheduleNotification({
      id: `medication_${medicationName}_${time.getTime()}`,
      title: 'Medication Reminder',
      body: `Time to take ${medicationName}`,
      trigger: { date: time } as Notifications.NotificationTriggerInput,
      data: { 
        type: 'medication', 
        medicationName,
        action: 'reminder'
      },
    });
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    return this.preferences;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await this.savePreferences();
  }

  /**
   * Get push token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      if (stored) {
        this.preferences = { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  /**
   * Load push token from storage
   */
  private async loadPushToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (token) {
        this.pushToken = token;
      }
    } catch (error) {
      console.error('Failed to load push token:', error);
    }
  }

  /**
   * Save push token to storage
   */
  private async savePushToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  }

  /**
   * Clear all notification data
   */
  async clearNotificationData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATION_PREFERENCES_KEY);
      await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
      await this.cancelAllNotifications();
      this.preferences = defaultPreferences;
      this.pushToken = null;
      console.log('Notification data cleared');
    } catch (error) {
      console.error('Failed to clear notification data:', error);
    }
  }
}

export default NotificationService;