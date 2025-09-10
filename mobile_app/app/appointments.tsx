import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

// Dummy appointment data
const appointmentData = {
  id: '1',
  doctor: {
    name: 'Dr. Rajesh Kumar',
    specialization: 'Panchakarma & Detoxification',
    clinic: 'Ayurveda Wellness Center',
    area: 'Banjara Hills',
    image: '👨‍⚕️',
  },
  date: '2024-01-20',
  time: '10:00 AM',
  status: 'confirmed',
  consultationFee: 800,
  bookingId: 'AYR001234',
};

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [appointmentCompleted, setAppointmentCompleted] = useState(false);

  const handleCompleteAppointment = () => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            setAppointmentCompleted(true);
            setTimeout(() => {
              Alert.alert(
                'Appointment Completed!',
                'Thank you for visiting. You can now access your personalized dashboard.',
                [
                  {
                    text: 'Go to Dashboard',
                    onPress: () => router.replace('/dashboard' as any),
                  },
                ]
              );
            }, 1000);
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Reschedule functionality will be available soon.');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cancelled', 'Your appointment has been cancelled.');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            Your Appointments
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Manage your consultations
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appointment Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIndicator,
              { 
                backgroundColor: appointmentCompleted 
                  ? colors.herbalGreen 
                  : colors.softOrange 
              }
            ]}>
              <Ionicons 
                name={appointmentCompleted ? "checkmark" : "time"} 
                size={16} 
                color="white" 
              />
            </View>
            <Text style={[styles.statusText, { color: colors.text }]}>
              {appointmentCompleted ? 'Completed' : 'Upcoming Appointment'}
            </Text>
          </View>
          
          {!appointmentCompleted && (
            <Text style={[styles.statusSubtext, { color: colors.icon }]}>
              Your consultation is scheduled
            </Text>
          )}
        </View>

        {/* Appointment Details */}
        <View style={[styles.appointmentCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.appointmentHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Appointment Details
            </Text>
            <View style={[styles.bookingId, { backgroundColor: colors.lightGreen }]}>
              <Text style={[styles.bookingIdText, { color: colors.herbalGreen }]}>
                #{appointmentData.bookingId}
              </Text>
            </View>
          </View>

          {/* Doctor Info */}
          <View style={styles.doctorSection}>
            <Text style={styles.doctorImage}>{appointmentData.doctor.image}</Text>
            <View style={styles.doctorInfo}>
              <Text style={[styles.doctorName, { color: colors.text }]}>
                {appointmentData.doctor.name}
              </Text>
              <Text style={[styles.specialization, { color: colors.herbalGreen }]}>
                {appointmentData.doctor.specialization}
              </Text>
              <View style={styles.clinicInfo}>
                <Ionicons name="business" size={14} color={colors.icon} />
                <Text style={[styles.clinicText, { color: colors.icon }]}>
                  {appointmentData.doctor.clinic}
                </Text>
              </View>
              <View style={styles.locationInfo}>
                <Ionicons name="location" size={14} color={colors.icon} />
                <Text style={[styles.locationText, { color: colors.icon }]}>
                  {appointmentData.doctor.area}, Hyderabad
                </Text>
              </View>
            </View>
          </View>

          {/* Appointment Time */}
          <View style={styles.timeSection}>
            <View style={styles.timeItem}>
              <Ionicons name="calendar" size={20} color={colors.herbalGreen} />
              <View style={styles.timeInfo}>
                <Text style={[styles.timeLabel, { color: colors.icon }]}>Date</Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {formatDate(appointmentData.date)}
                </Text>
              </View>
            </View>
            
            <View style={styles.timeItem}>
              <Ionicons name="time" size={20} color={colors.herbalGreen} />
              <View style={styles.timeInfo}>
                <Text style={[styles.timeLabel, { color: colors.icon }]}>Time</Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {appointmentData.time}
                </Text>
              </View>
            </View>
          </View>

          {/* Consultation Fee */}
          <View style={[styles.feeSection, { borderColor: colors.inputBorder }]}>
            <View style={styles.feeInfo}>
              <Text style={[styles.feeLabel, { color: colors.icon }]}>
                Consultation Fee
              </Text>
              <Text style={[styles.feeAmount, { color: colors.herbalGreen }]}>
                ₹{appointmentData.consultationFee}
              </Text>
            </View>
            <View style={[styles.paidBadge, { backgroundColor: colors.lightGreen }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.herbalGreen} />
              <Text style={[styles.paidText, { color: colors.herbalGreen }]}>Paid</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!appointmentCompleted ? (
          <View style={styles.actionButtons}>
            {/* Complete Appointment Button */}
            <TouchableOpacity onPress={handleCompleteAppointment}>
              <LinearGradient
                colors={[colors.herbalGreen, '#4A9D6A']}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Complete Appointment</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Actions */}
            <View style={styles.secondaryButtons}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor: colors.inputBorder }]}
                onPress={handleReschedule}
              >
                <Ionicons name="calendar" size={18} color={colors.herbalGreen} />
                <Text style={[styles.secondaryButtonText, { color: colors.herbalGreen }]}>
                  Reschedule
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor: colors.inputBorder }]}
                onPress={handleCancel}
              >
                <Ionicons name="close-circle" size={18} color="#FF6B6B" />
                <Text style={[styles.secondaryButtonText, { color: '#FF6B6B' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.completedSection}>
            <View style={[styles.completedCard, { backgroundColor: colors.lightGreen }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.herbalGreen} />
              <Text style={[styles.completedTitle, { color: colors.herbalGreen }]}>
                Appointment Completed!
              </Text>
              <Text style={[styles.completedSubtitle, { color: colors.icon }]}>
                Thank you for visiting. Your personalized plan is ready.
              </Text>
            </View>
          </View>
        )}

        {/* Help Section */}
        <View style={[styles.helpSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>Need Help?</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="call" size={16} color={colors.herbalGreen} />
            <Text style={[styles.helpButtonText, { color: colors.herbalGreen }]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard' as any)}>
          <Ionicons name="home" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color={colors.herbalGreen} />
          <Text style={[styles.navLabel, { color: colors.herbalGreen }]}>Appointments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile' as any)}>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSubtext: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 44,
  },
  appointmentCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookingId: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  doctorSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  doctorImage: {
    fontSize: 40,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  clinicText: {
    fontSize: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  feeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
  },
  feeInfo: {
    flex: 1,
  },
  feeLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  paidText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  completedSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  completedCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  helpSection: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpButtonText: {
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
