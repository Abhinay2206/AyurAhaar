import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { AppointmentService, Appointment } from '@/src/services/appointment';
import { PlanService, PlanData } from '@/src/services/plan';

// Current patient data
const currentPatient = {
  name: 'Rahul Sharma',
  constitution: 'Vata-Pitta',
  planType: 'AI Generated',
  startDate: '2024-01-15',
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { patient } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Use authenticated patient data or fallback to dummy data
  const displayPatient = patient || currentPatient;

  // Fetch real appointment data and plan data
  const fetchAppointments = useCallback(async () => {
    if (!patient?._id) {
      setIsLoadingAppointments(false);
      return;
    }

    try {
      setIsLoadingAppointments(true);
      const appointments = await AppointmentService.getPatientAppointments(patient._id);
      
      // Filter for upcoming appointments (exclude cancelled) and sort by date
      const upcoming = appointments
        .filter(apt => 
          new Date(apt.date) >= new Date() && 
          apt.status !== 'cancelled'
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Keep empty array on error
      setUpcomingAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [patient?._id]);

  const fetchPlanData = useCallback(async () => {
    if (!patient?._id) {
      setIsLoadingPlan(false);
      return;
    }

    try {
      setIsLoadingPlan(true);
      const planData = await PlanService.getCurrentPlan(patient._id);
      setCurrentPlan(planData);
    } catch (error) {
      console.error('Error fetching plan data:', error);
      // Set to null if error (no plan available)
      setCurrentPlan(null);
    } finally {
      setIsLoadingPlan(false);
    }
  }, [patient?._id]);

  useEffect(() => {
    fetchAppointments();
    fetchPlanData();
  }, [fetchAppointments, fetchPlanData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (patient?._id) {
        fetchAppointments();
        fetchPlanData();
      }
    }, [fetchAppointments, fetchPlanData, patient?._id])
  );

  const handleAppointments = () => {
    router.push('/appointments' as any);
  };

  const handleProfile = () => {
    router.push('/profile' as any);
  };

  const handleAppointmentDetails = (appointmentId: string) => {
    router.push(`/appointments?appointmentId=${appointmentId}` as any);
  };

  return (
    <ThemedView style={styles.container}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={[styles.logoContainer, { backgroundColor: colors.herbalGreen }]}>
            <Ionicons name="leaf" size={24} color="white" />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={[styles.welcomeText, { color: colors.icon }]}>
              Welcome back,
            </ThemedText>
            <ThemedText style={[styles.userName, { color: colors.text }]}>
              {displayPatient.name}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
          <Ionicons name="person-circle" size={32} color={colors.herbalGreen} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >

      {/* Plan Info Card - Only show if patient has an active plan */}
      {currentPlan && currentPlan.planType !== 'none' && (
        <View style={[styles.planCard, { backgroundColor: colors.cardBackground }]}>
          <LinearGradient
            colors={[colors.herbalGreen, '#4A9D6A']}
            style={styles.planHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>Your Ayurveda Plan</Text>
              <Text style={styles.planSubtitle}>
                {currentPlan.planType === 'ai' ? 'AI Generated' : 'Doctor Prescribed'} • {(displayPatient as any).constitution || 'Vata-Pitta'}
              </Text>
            </View>
            <Ionicons name="sparkles" size={24} color="white" />
          </LinearGradient>
          
          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.herbalGreen }]}>7</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.softOrange }]}>24</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Meals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.herbalGreen }]}>100%</Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Natural</Text>
            </View>
          </View>
        </View>
      )}

      {/* Appointments Section */}
      <View style={[styles.appointmentsSection, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.appointmentsHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Upcoming Appointments
          </ThemedText>
          <TouchableOpacity onPress={handleAppointments}>
            <Text style={[styles.viewAllText, { color: colors.herbalGreen }]}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingAppointments ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.icon }]}>Loading appointments...</Text>
          </View>
        ) : upcomingAppointments.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.appointmentsScroll}>
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <View key={appointment._id} style={[styles.appointmentCard, { backgroundColor: colors.background }]}>
                <View style={styles.appointmentHeader}>
                  <View style={[styles.appointmentStatusBadge, { 
                    backgroundColor: appointment.status === 'confirmed' ? colors.lightGreen : colors.lightOrange 
                  }]}>
                    <Text style={[styles.appointmentStatusText, { 
                      color: appointment.status === 'confirmed' ? colors.herbalGreen : colors.softOrange 
                    }]}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={[styles.appointmentFee, { color: colors.softOrange }]}>
                    ₹{appointment.consultationFee}
                  </Text>
                </View>

                <View style={styles.appointmentDoctorInfo}>
                  <Text style={styles.appointmentDoctorEmoji}>👨‍⚕️</Text>
                  <View style={styles.appointmentDoctorDetails}>
                    <Text style={[styles.appointmentDoctorName, { color: colors.text }]} numberOfLines={1}>
                      {appointment.doctorName}
                    </Text>
                    <Text style={[styles.appointmentSpecialization, { color: colors.icon }]} numberOfLines={2}>
                      {appointment.doctorSpecialization}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDateTime}>
                  <View style={styles.appointmentDateRow}>
                    <Ionicons name="calendar" size={14} color={colors.herbalGreen} />
                    <Text style={[styles.appointmentDate, { color: colors.text }]}>
                      {new Date(appointment.date).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.appointmentTimeRow}>
                    <Ionicons name="time" size={14} color={colors.herbalGreen} />
                    <Text style={[styles.appointmentTime, { color: colors.text }]}>
                      {appointment.time}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.appointmentViewButton, { backgroundColor: colors.herbalGreen }]}
                  onPress={() => handleAppointmentDetails(appointment._id)}
                >
                  <Text style={styles.appointmentViewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noAppointmentsContainer}>
            <Ionicons name="calendar-outline" size={40} color={colors.icon} />
            <Text style={[styles.noAppointmentsText, { color: colors.icon }]}>
              No upcoming appointments
            </Text>
            <TouchableOpacity
              style={[styles.bookNowButton, { backgroundColor: colors.herbalGreen }]}
              onPress={() => router.push('/doctor-list' as any)}
            >
              <Text style={styles.bookNowButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Plan Section - Only show if patient has an active plan */}
      {isLoadingPlan ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading plan...</Text>
        </View>
      ) : currentPlan && currentPlan.planType !== 'none' ? (
        <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Active Plan ({currentPlan.planType === 'ai' ? 'AI Generated' : 'Doctor Prescribed'})
          </Text>
          <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.mealDescription, { color: colors.icon }]}>
              {currentPlan.planType === 'ai' ? 
                'Your personalized AI-generated meal plan is active.' : 
                'Your doctor-prescribed plan is active.'}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noPlanContainer}>
          <View style={[styles.noPlanCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="nutrition-outline" size={80} color={colors.icon} />
            <Text style={[styles.noPlanTitle, { color: colors.text }]}>No Active Meal Plan</Text>
            <Text style={[styles.noPlanDescription, { color: colors.icon }]}>
              Start your Ayurvedic journey by generating a personalized AI meal plan or booking an appointment with our expert doctors.
            </Text>
            <View style={styles.noPlanActions}>
              <TouchableOpacity
                style={[styles.primaryActionButton, { backgroundColor: colors.herbalGreen }]}
                onPress={() => router.push('/ai-plan-generation' as any)}
              >
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.primaryActionButtonText}>Generate AI Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryActionButton, { borderColor: colors.herbalGreen }]}
                onPress={() => router.push('/doctor-list' as any)}
              >
                <Ionicons name="medical" size={20} color={colors.herbalGreen} />
                <Text style={[styles.secondaryActionButtonText, { color: colors.herbalGreen }]}>Book Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={colors.herbalGreen} />
          <Text style={[styles.navLabel, { color: colors.herbalGreen }]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleAppointments}>
          <Ionicons name="calendar" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={handleProfile}>
          <Ionicons name="person" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Profile</Text>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  planCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  daySelector: {
    marginBottom: 20,
  },
  dayScroll: {
    paddingHorizontal: 16,
  },
  dayButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mealCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTime: {
    fontSize: 12,
  },
  mealDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 48,
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
  // Appointments section styles
  appointmentsSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  appointmentsScroll: {
    marginHorizontal: -4,
  },
  appointmentCard: {
    width: 260,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentFee: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  appointmentDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentDoctorEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  appointmentDoctorDetails: {
    flex: 1,
  },
  appointmentDoctorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  appointmentSpecialization: {
    fontSize: 12,
  },
  appointmentDateTime: {
    marginBottom: 12,
  },
  appointmentDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 12,
    marginLeft: 6,
  },
  appointmentTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    fontSize: 12,
    marginLeft: 6,
  },
  appointmentViewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  appointmentViewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  noAppointmentsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noAppointmentsText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  bookNowButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookNowButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  // No Plan Styles
  noPlanContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  noPlanCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  noPlanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  noPlanDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  noPlanActions: {
    width: '100%',
    gap: 16,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
