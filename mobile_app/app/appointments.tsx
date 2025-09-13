import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { AppointmentService, Appointment } from '@/src/services/appointment';
import AppointmentCard from '@/src/components/AppointmentCard';

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { patient } = useAuth();
  const { appointmentId } = useLocalSearchParams();
  
  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (appointmentId && appointments.length > 0) {
      const appointment = appointments.find(apt => apt._id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
      }
    }
  }, [appointmentId, appointments]);

  const fetchAppointments = useCallback(async () => {
    if (!patient?._id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const allAppointments = await AppointmentService.getPatientAppointments(patient._id);
      setAppointments(allAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  }, [patient?._id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleBackToList = () => {
    setSelectedAppointment(null);
    router.setParams({ appointmentId: undefined });
  };

  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    setAppointments(prevAppointments =>
      prevAppointments.map(apt =>
        apt._id === updatedAppointment._id ? updatedAppointment : apt
      )
    );
    
    if (selectedAppointment?._id === updatedAppointment._id) {
      setSelectedAppointment(updatedAppointment);
    }
  };

  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;

    return (
      <ScrollView style={styles.detailsContainer}>
        <View style={styles.detailsHeader}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Appointment Details</Text>
        </View>

        <View style={[styles.appointmentCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.doctorName, { color: colors.text }]}>
              {selectedAppointment.doctorName}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: selectedAppointment.status === 'confirmed' ? colors.lightGreen : colors.lightOrange }
            ]}>
              <Text style={[
                styles.statusText,
                { color: selectedAppointment.status === 'confirmed' ? colors.herbalGreen : colors.softOrange }
              ]}>
                {selectedAppointment.status}
              </Text>
            </View>
          </View>

          <Text style={[styles.specialization, { color: colors.icon }]}>
            {selectedAppointment.doctorSpecialization}
          </Text>

          <View style={styles.appointmentInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {new Date(selectedAppointment.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {selectedAppointment.time}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="card" size={16} color={colors.herbalGreen} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                ₹{selectedAppointment.consultationFee} • {selectedAppointment.paymentMethod.toUpperCase()}
              </Text>
            </View>
          </View>

          {selectedAppointment.consultationDetails.symptoms && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Symptoms</Text>
              <Text style={[styles.sectionContent, { color: colors.icon }]}>
                {selectedAppointment.consultationDetails.symptoms}
              </Text>
            </View>
          )}

          {selectedAppointment.doctorNotes && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Doctor Notes</Text>
              <Text style={[styles.sectionContent, { color: colors.icon }]}>
                {selectedAppointment.doctorNotes}
              </Text>
            </View>
          )}

          {selectedAppointment.prescription && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Prescription</Text>
              <Text style={[styles.sectionContent, { color: colors.icon }]}>
                {selectedAppointment.prescription}
              </Text>
            </View>
          )}

          {selectedAppointment.dietPlan?.isVisible && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Diet Plan</Text>
              <Text style={[styles.sectionContent, { color: colors.icon }]}>
                {selectedAppointment.dietPlan.plan || 'Diet plan will be provided by your doctor.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderAppointmentsList = () => (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={[colors.herbalGreen || '#4A9D6A', colors.lightGreen || '#66B884']}
        style={styles.gradientHeader}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Appointments</Text>
            <Text style={styles.headerSubtitle}>
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.herbalGreen} />
            <Text style={[styles.loadingText, { color: colors.icon }]}>Loading appointments...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.lightGreen }]}>
              <Ionicons name="calendar-outline" size={50} color={colors.herbalGreen} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Appointments</Text>
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              You haven&apos;t booked any appointments yet. Start your wellness journey by booking a consultation with our expert Ayurvedic doctors.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.herbalGreen }]}
              onPress={() => router.push('/doctor-list' as any)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Book Your First Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onUpdate={handleAppointmentUpdate}
                onPress={() => setSelectedAppointment(appointment)}
                showActions={true}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {selectedAppointment ? renderAppointmentDetails() : renderAppointmentsList()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollContainer: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 50,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appointmentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A9D6A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  specialization: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  appointmentDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  appointmentInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});
