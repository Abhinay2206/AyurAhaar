import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/src/components/common/LanguageSelector';
import NotificationSettings from '@/src/components/notification/NotificationSettings';
import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { default as PatientService, PatientProfile } from '@/src/services/patient';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await PatientService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to load profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
      console.error('Profile fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigation is handled in the logout function
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon.');
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              Profile
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={24} color={colors.herbalGreen} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.herbalGreen} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              Profile
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={24} color={colors.herbalGreen} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to load profile</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.herbalGreen }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Profile
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create" size={24} color={colors.herbalGreen} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.avatar, { backgroundColor: colors.herbalGreen }]}>
            <Text style={styles.avatarText}>
              {profile.name.split(' ').map((n: string) => n[0]).join('')}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {profile.name}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.icon }]}>
            {profile.email}
          </Text>
          <View style={[styles.constitutionBadge, { backgroundColor: colors.lightGreen }]}>
            <Text style={[styles.constitutionText, { color: colors.herbalGreen }]}>
              {profile.currentPlan.type === 'none' ? 'No Plan' : `${profile.currentPlan.type.toUpperCase()} Plan`}
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Personal Information
          </Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Phone</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.phone || 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Age</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.age ? `${profile.age} years` : 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="fitness" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Weight</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.weight ? `${profile.weight} kg` : 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="resize" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Height</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.height ? `${profile.height} cm` : 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Member Since</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        {/* Health Information */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Health Information
          </Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="heart" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoLabel, { color: colors.icon }]}>Lifestyle</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.lifestyle || 'Not specified'}
            </Text>
          </View>

          {profile.allergies && profile.allergies.length > 0 && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="warning" size={16} color={colors.herbalGreen} />
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Allergies</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.allergies.join(', ')}
              </Text>
            </View>
          )}

          {profile.healthConditions && profile.healthConditions.length > 0 && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="medical" size={16} color={colors.herbalGreen} />
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Health Conditions</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.healthConditions.join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Current Plan */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Current Plan
          </Text>
          <View style={[styles.planCard, { backgroundColor: colors.lightGreen }]}>
            <Ionicons name="nutrition" size={24} color={colors.herbalGreen} />
            <Text style={[styles.planText, { color: colors.herbalGreen }]}>
              {profile.currentPlan.type === 'none' ? 'No Active Plan' : 
               profile.currentPlan.type === 'ai' ? 'AI Generated Plan' : 'Doctor Prescribed Plan'}
            </Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>
          
          {[
            { icon: 'notifications', label: 'Notifications', action: () => setShowNotificationSettings(true) },
            { icon: 'help-circle', label: 'Help & Support', action: () => {} },
            { icon: 'document-text', label: 'Terms & Conditions', action: () => {} },
            { icon: 'shield-checkmark', label: 'Privacy Policy', action: () => {} },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <Ionicons name={item.icon as any} size={20} color={colors.icon} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.icon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('profile.settings')}
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={20} color={colors.herbalGreen} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('common.language')}
              </Text>
            </View>
            <View style={styles.settingValue}>
              <LanguageSelector compact={false} showLabel={false} />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: '#FF6B6B' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#FF6B6B" />
          <Text style={[styles.logoutText, { color: '#FF6B6B' }]}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard' as any)}>
          <Ionicons name="home" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/appointments' as any)}>
          <Ionicons name="calendar" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color={colors.herbalGreen} />
          <Text style={[styles.navLabel, { color: colors.herbalGreen }]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <NotificationSettings onClose={() => setShowNotificationSettings(false)} />
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  constitutionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  constitutionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  planText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 12,
  },
  planButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  planButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    minWidth: 150,
    alignItems: 'flex-end',
  },
});
