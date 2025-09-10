import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

// Dummy patient data
const currentPatient = {
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 9876543210',
  age: 28,
  constitution: 'Vata-Pitta',
  address: 'Banjara Hills, Hyderabad',
  joinDate: '2024-01-15',
  planType: 'AI Generated',
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be available soon.');
  };

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
              {currentPatient.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {currentPatient.name}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.icon }]}>
            {currentPatient.email}
          </Text>
          <View style={[styles.constitutionBadge, { backgroundColor: colors.lightGreen }]}>
            <Text style={[styles.constitutionText, { color: colors.herbalGreen }]}>
              {currentPatient.constitution} Constitution
            </Text>
          </View>
        </View>

        {/* Personal Information */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Personal Information
          </Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="call" size={20} color={colors.herbalGreen} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Phone</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {currentPatient.phone}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color={colors.herbalGreen} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Age</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {currentPatient.age} years
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color={colors.herbalGreen} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Address</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {currentPatient.address}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time" size={20} color={colors.herbalGreen} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>Member since</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {new Date(currentPatient.joinDate).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Plan Information */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Current Plan
          </Text>
          
          <View style={styles.planInfo}>
            <View style={[styles.planIcon, { backgroundColor: colors.lightGreen }]}>
              <Ionicons name="sparkles" size={24} color={colors.herbalGreen} />
            </View>
            <View style={styles.planDetails}>
              <Text style={[styles.planName, { color: colors.text }]}>
                {currentPatient.planType}
              </Text>
              <Text style={[styles.planDescription, { color: colors.icon }]}>
                Personalized Ayurveda meal plan
              </Text>
            </View>
            <TouchableOpacity style={styles.planButton}>
              <Text style={[styles.planButtonText, { color: colors.herbalGreen }]}>
                View
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Options */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Settings
          </Text>
          
          {[
            { icon: 'notifications', label: 'Notifications', action: () => {} },
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

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: '#FF6B6B' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#FF6B6B" />
          <Text style={[styles.logoutText, { color: '#FF6B6B' }]}>Logout</Text>
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
});
