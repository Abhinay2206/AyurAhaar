import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import { NotificationPreferences } from '../../services/notification';

interface NotificationSettingsProps {
  onClose?: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const {
    preferences,
    hasPermissions,
    isInitialized,
    updatePreferences,
    requestPermissions,
    sendLocalNotification,
  } = useNotification();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTogglePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!hasPermissions && value) {
      // Request permissions if trying to enable notifications
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          t('notification.permission_required'),
          t('notification.permission_message'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.settings'), onPress: () => {
              // TODO: Open device settings
            }},
          ]
        );
        return;
      }
    }

    try {
      setIsUpdating(true);
      await updatePreferences({ [key]: value });
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      Alert.alert(
        t('common.error'),
        t('notification.update_failed')
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            t('notification.permission_required'),
            t('notification.permission_message')
          );
          return;
        }
      }

      // Send a test notification using the notification context
      await sendLocalNotification(
        t('notification.test_title'),
        t('notification.test_message')
      );
      
      Alert.alert(
        t('notification.test_sent'),
        t('notification.test_sent_message')
      );
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert(
        t('common.error'),
        t('notification.test_failed')
      );
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('notification.loading')}</Text>
      </View>
    );
  }

  const settingItems = [
    {
      key: 'enabled' as keyof NotificationPreferences,
      title: t('notification.enable_notifications'),
      subtitle: t('notification.enable_notifications_desc'),
      icon: 'notifications',
    },
    {
      key: 'appointments' as keyof NotificationPreferences,
      title: t('notification.appointment_reminders'),
      subtitle: t('notification.appointment_reminders_desc'),
      icon: 'calendar',
      disabled: !preferences.enabled,
    },
    {
      key: 'plans' as keyof NotificationPreferences,
      title: t('notification.plan_notifications'),
      subtitle: t('notification.plan_notifications_desc'),
      icon: 'medical',
      disabled: !preferences.enabled,
    },
    {
      key: 'reminders' as keyof NotificationPreferences,
      title: t('notification.medication_reminders'),
      subtitle: t('notification.medication_reminders_desc'),
      icon: 'timer',
      disabled: !preferences.enabled,
    },
    {
      key: 'marketing' as keyof NotificationPreferences,
      title: t('notification.marketing_notifications'),
      subtitle: t('notification.marketing_notifications_desc'),
      icon: 'megaphone',
      disabled: !preferences.enabled,
    },
  ];

  const soundItems = [
    {
      key: 'sound' as keyof NotificationPreferences,
      title: t('notification.enable_sound'),
      subtitle: t('notification.enable_sound_desc'),
      icon: 'volume-high',
      disabled: !preferences.enabled,
    },
    {
      key: 'vibration' as keyof NotificationPreferences,
      title: t('notification.enable_vibration'),
      subtitle: t('notification.enable_vibration_desc'),
      icon: 'phone-portrait',
      disabled: !preferences.enabled,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notification.settings_title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Permission Status */}
      {!hasPermissions && (
        <View style={styles.permissionBanner}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.permissionText}>
            {t('notification.permission_disabled')}
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={() => requestPermissions()}
          >
            <Text style={styles.enableButtonText}>{t('common.enable')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notification Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('notification.notification_types')}</Text>
        {settingItems.map((item) => (
          <View key={item.key} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[
                styles.iconContainer,
                { opacity: item.disabled ? 0.5 : 1 }
              ]}>
                <Ionicons name={item.icon as any} size={20} color="#4CAF50" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[
                  styles.settingTitle,
                  { opacity: item.disabled ? 0.5 : 1 }
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  styles.settingSubtitle,
                  { opacity: item.disabled ? 0.5 : 1 }
                ]}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            <Switch
              value={preferences[item.key] as boolean}
              onValueChange={(value) => handleTogglePreference(item.key, value)}
              disabled={item.disabled || isUpdating}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>

      {/* Sound & Vibration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('notification.sound_vibration')}</Text>
        {soundItems.map((item) => (
          <View key={item.key} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[
                styles.iconContainer,
                { opacity: item.disabled ? 0.5 : 1 }
              ]}>
                <Ionicons name={item.icon as any} size={20} color="#4CAF50" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[
                  styles.settingTitle,
                  { opacity: item.disabled ? 0.5 : 1 }
                ]}>
                  {item.title}
                </Text>
                <Text style={[
                  styles.settingSubtitle,
                  { opacity: item.disabled ? 0.5 : 1 }
                ]}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
            <Switch
              value={preferences[item.key] as boolean}
              onValueChange={(value) => handleTogglePreference(item.key, value)}
              disabled={item.disabled || isUpdating}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>

      {/* Test Notification */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.testButton, { opacity: preferences.enabled ? 1 : 0.5 }]}
          onPress={handleTestNotification}
          disabled={!preferences.enabled || isUpdating}
        >
          <Ionicons name="notifications" size={20} color="#4CAF50" />
          <Text style={styles.testButtonText}>
            {t('notification.send_test')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>{t('notification.about_notifications')}</Text>
        <Text style={styles.infoText}>
          {t('notification.about_notifications_desc')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  permissionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#F57C00',
  },
  enableButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default NotificationSettings;