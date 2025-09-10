import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

export default function PlanSelectionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleAIPlan = () => {
    // Navigate to AI plan generation
    router.push('/ai-plan-generation' as any);
  };

  const handleDoctorAppointment = () => {
    // Navigate to doctor list
    router.push('/doctor-list' as any);
  };

  return (
    <ThemedView style={styles.container}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.herbalGreen }]}>
          <Ionicons name="leaf" size={32} color="white" />
        </View>
        <ThemedText style={[styles.welcomeTitle, { color: colors.text }]}>
          Welcome to Ayurahaar
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          Choose how you want to start your journey
        </ThemedText>
      </View>

      {/* Option Cards */}
      <View style={styles.optionsContainer}>
        {/* AI Personalized Plan Card */}
        <TouchableOpacity style={styles.cardContainer} onPress={handleAIPlan}>
          <LinearGradient
            colors={[colors.herbalGreen, '#4A9D6A']}
            style={[styles.optionCard, styles.aiCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="sparkles" size={32} color="white" />
              <Ionicons name="leaf" size={24} color="white" style={styles.leafIcon} />
            </View>
            <Text style={styles.cardTitle}>AI Personalized Plan</Text>
            <Text style={styles.cardDescription}>
              Get an instant, personalized Ayurveda meal plan tailored to your needs
            </Text>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Doctor Appointment Card */}
        <TouchableOpacity style={styles.cardContainer} onPress={handleDoctorAppointment}>
          <LinearGradient
            colors={[colors.softOrange, '#E09852']}
            style={[styles.optionCard, styles.doctorCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardIconContainer}>
              <Ionicons name="medical" size={32} color="white" />
              <Ionicons name="person" size={24} color="white" style={styles.doctorIcon} />
            </View>
            <Text style={styles.cardTitle}>Doctor Appointment</Text>
            <Text style={styles.cardDescription}>
              Consult with certified Ayurveda doctors in Hyderabad
            </Text>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <ThemedText style={[styles.infoText, { color: colors.icon }]}>
          Both options will lead you to your personalized dashboard
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 10,
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  optionCard: {
    borderRadius: 20,
    padding: 24,
    minHeight: 180,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  aiCard: {
    marginBottom: 10,
  },
  doctorCard: {
    marginBottom: 10,
  },
  cardIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  leafIcon: {
    position: 'absolute',
    left: 20,
    top: 4,
    opacity: 0.8,
  },
  doctorIcon: {
    position: 'absolute',
    left: 20,
    top: 4,
    opacity: 0.8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInfo: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
