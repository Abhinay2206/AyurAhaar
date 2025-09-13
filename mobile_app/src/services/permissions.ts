import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS_GRANTED_KEY = 'permissions_granted';

export interface PermissionsStatus {
  location: boolean;
  mediaLibrary: boolean;
  contacts: boolean;
  allGranted: boolean;
}

export class PermissionsService {
  static async checkAllPermissions(): Promise<PermissionsStatus> {
    try {
      const [locationStatus, mediaStatus, contactsStatus] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        MediaLibrary.getPermissionsAsync(),
        Contacts.getPermissionsAsync(),
      ]);

      const status: PermissionsStatus = {
        location: locationStatus.status === 'granted',
        mediaLibrary: mediaStatus.status === 'granted',
        contacts: contactsStatus.status === 'granted',
        allGranted: false,
      };

      status.allGranted = status.location && status.mediaLibrary && status.contacts;
      return status;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        location: false,
        mediaLibrary: false,
        contacts: false,
        allGranted: false,
      };
    }
  }

  static async requestAllPermissions(): Promise<PermissionsStatus> {
    try {
      // Check if permissions were already requested and granted
      const alreadyGranted = await AsyncStorage.getItem(PERMISSIONS_GRANTED_KEY);
      if (alreadyGranted === 'true') {
        return await this.checkAllPermissions();
      }

      // Show explanation dialog
      return new Promise((resolve) => {
        Alert.alert(
          'Permissions Required',
          'AyurAhaar needs access to your location to find nearby doctors, your photo library for profile pictures, and contacts to share doctor information.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(this.getDefaultDeniedStatus()),
            },
            {
              text: 'Grant Permissions',
              onPress: async () => {
                const result = await this.requestPermissions();
                resolve(result);
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return this.getDefaultDeniedStatus();
    }
  }

  private static async requestPermissions(): Promise<PermissionsStatus> {
    try {
      const results = await Promise.allSettled([
        Location.requestForegroundPermissionsAsync(),
        MediaLibrary.requestPermissionsAsync(),
        Contacts.requestPermissionsAsync(),
      ]);

      const [locationResult, mediaResult, contactsResult] = results;

      const status: PermissionsStatus = {
        location: locationResult.status === 'fulfilled' && locationResult.value.status === 'granted',
        mediaLibrary: mediaResult.status === 'fulfilled' && mediaResult.value.status === 'granted',
        contacts: contactsResult.status === 'fulfilled' && contactsResult.value.status === 'granted',
        allGranted: false,
      };

      status.allGranted = status.location && status.mediaLibrary && status.contacts;

      // Store permission status
      if (status.allGranted) {
        await AsyncStorage.setItem(PERMISSIONS_GRANTED_KEY, 'true');
      }

      return status;
    } catch (error) {
      console.error('Error requesting individual permissions:', error);
      return this.getDefaultDeniedStatus();
    }
  }

  private static getDefaultDeniedStatus(): PermissionsStatus {
    return {
      location: false,
      mediaLibrary: false,
      contacts: false,
      allGranted: false,
    };
  }

  static async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  static async resetPermissions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PERMISSIONS_GRANTED_KEY);
    } catch (error) {
      console.error('Error resetting permissions:', error);
    }
  }
}