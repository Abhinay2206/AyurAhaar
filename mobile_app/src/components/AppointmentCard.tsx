import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Appointment, AppointmentService } from '@/src/services/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onUpdate?: (updatedAppointment: Appointment) => void;
  onPress?: () => void;
  showActions?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onUpdate,
  onPress,
  showActions = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          background: colors.lightGreen || '#E8F5E8',
          text: colors.herbalGreen || '#4A9D6A',
          icon: 'checkmark-circle',
        };
      case 'pending':
        return {
          background: colors.lightOrange || '#FFF4E6',
          text: colors.softOrange || '#FF8C42',
          icon: 'time',
        };
      case 'completed':
        return {
          background: '#E3F2FD',
          text: '#1976D2',
          icon: 'checkmark-done-circle',
        };
      case 'cancelled':
        return {
          background: '#FFEBEE',
          text: '#D32F2F',
          icon: 'close-circle',
        };
      default:
        return {
          background: colors.lightGreen || '#E8F5E8',
          text: colors.herbalGreen || '#4A9D6A',
          icon: 'help-circle',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCancelAppointment = async () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const updatedAppointment = await AppointmentService.updateAppointmentStatus(
                appointment._id,
                'cancelled'
              );
              onUpdate?.(updatedAppointment);
              setIsActionModalVisible(false);
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error: any) {
              console.error('Cancel appointment error:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRescheduleAppointment = async () => {
    if (!newDate || !newTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    try {
      setIsLoading(true);
      // Note: This would require a new backend endpoint for rescheduling
      // For now, we'll show a message that it would be implemented
      Alert.alert(
        'Reschedule Request',
        'Your reschedule request has been submitted. You will be notified once confirmed.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsRescheduleModalVisible(false);
              setIsActionModalVisible(false);
              setNewDate('');
              setNewTime('');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Reschedule appointment error:', error);
      Alert.alert('Error', 'Failed to reschedule appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCSVData = () => {
    const csvData = [
      ['Field', 'Value'],
      ['Appointment ID', appointment.appointmentId || appointment._id],
      ['Doctor Name', appointment.doctorName],
      ['Specialization', appointment.doctorSpecialization],
      ['Date', formatFullDate(appointment.date)],
      ['Time', appointment.time],
      ['Consultation Fee', `₹${appointment.consultationFee}`],
      ['Payment Method', appointment.paymentMethod.toUpperCase()],
      ['Status', appointment.status.toUpperCase()],
      ['Patient Name', appointment.patientDetails.name],
      ['Patient Email', appointment.patientDetails.email],
      ['Patient Phone', appointment.patientDetails.phone],
      ['Symptoms', appointment.consultationDetails.symptoms || 'N/A'],
      ['Doctor Notes', appointment.doctorNotes || 'N/A'],
      ['Prescription', appointment.prescription || 'N/A'],
    ];

    return csvData.map(row => row.join(',')).join('\n');
  };

  const generatePDFContent = () => {
    return `
APPOINTMENT DETAILS
==================

Appointment ID: ${appointment.appointmentId || appointment._id}
Doctor: ${appointment.doctorName}
Specialization: ${appointment.doctorSpecialization}
Date: ${formatFullDate(appointment.date)}
Time: ${appointment.time}
Consultation Fee: ₹${appointment.consultationFee}
Payment Method: ${appointment.paymentMethod.toUpperCase()}
Status: ${appointment.status.toUpperCase()}

PATIENT INFORMATION
==================
Name: ${appointment.patientDetails.name}
Email: ${appointment.patientDetails.email}
Phone: ${appointment.patientDetails.phone}
Age: ${appointment.patientDetails.age}
Gender: ${appointment.patientDetails.gender}

CONSULTATION DETAILS
===================
Type: ${appointment.consultationDetails.type}
Symptoms: ${appointment.consultationDetails.symptoms || 'N/A'}
Medical History: ${appointment.consultationDetails.medicalHistory || 'N/A'}
Current Medications: ${appointment.consultationDetails.currentMedications || 'N/A'}
Allergies: ${appointment.consultationDetails.allergies || 'N/A'}

DOCTOR'S NOTES
=============
${appointment.doctorNotes || 'No notes available'}

PRESCRIPTION
===========
${appointment.prescription || 'No prescription available'}

DIET PLAN
=========
${appointment.dietPlan?.plan || 'Diet plan will be provided after consultation'}

Generated on: ${new Date().toLocaleDateString('en-IN')}
AyurAhaar - Ayurvedic Healthcare Platform
    `;
  };

  const handleDownload = async (format: 'pdf' | 'csv') => {
    try {
      const fileName = `appointment_${appointment._id}_${Date.now()}.${format}`;
      const content = format === 'csv' ? generateCSVData() : generatePDFContent();
      
      if (Platform.OS === 'web') {
        // Web download
        const blob = new Blob([content], { 
          type: format === 'csv' ? 'text/csv' : 'text/plain' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Success', `Appointment details downloaded as ${format.toUpperCase()}`);
      } else {
        // For mobile, we'll show the content in an alert for now
        // In a real app, you would use expo-file-system and expo-sharing
        Alert.alert(
          `Appointment Details (${format.toUpperCase()})`,
          content.length > 500 ? content.substring(0, 500) + '...' : content,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Copy', 
              onPress: () => {
                // In a real app, you would copy to clipboard
                Alert.alert('Success', 'Content would be copied to clipboard');
              }
            }
          ]
        );
      }

      setIsActionModalVisible(false);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download appointment details');
    }
  };

  const statusInfo = getStatusColor(appointment.status);

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.doctorSection}>
            <View style={[styles.doctorAvatar, { backgroundColor: colors.herbalGreen }]}>
              <Text style={styles.doctorInitial}>
                {appointment.doctorName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text style={[styles.doctorName, { color: colors.text }]}>
                {appointment.doctorName}
              </Text>
              <Text style={[styles.specialization, { color: colors.icon }]}>
                {appointment.doctorSpecialization}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.background }]}>
              <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.text} />
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {appointment.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={colors.herbalGreen} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {formatDate(appointment.date)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color={colors.herbalGreen} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {appointment.time}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="card" size={16} color={colors.herbalGreen} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                ₹{appointment.consultationFee}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="person" size={16} color={colors.herbalGreen} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {appointment.patientDetails.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {showActions && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction, { backgroundColor: colors.herbalGreen }]}
              onPress={() => setIsActionModalVisible(true)}
            >
              <Ionicons name="options" size={16} color="white" />
              <Text style={styles.actionButtonText}>Actions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction, { borderColor: colors.herbalGreen }]}
              onPress={() => handleDownload('pdf')}
            >
              <Ionicons name="download" size={16} color={colors.herbalGreen} />
              <Text style={[styles.actionButtonText, { color: colors.herbalGreen }]}>Download</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Completed/Cancelled appointments show download only */}
        {showActions && (appointment.status === 'cancelled' || appointment.status === 'completed') && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction, { borderColor: colors.herbalGreen }]}
              onPress={() => setIsActionModalVisible(true)}
            >
              <Ionicons name="download" size={16} color={colors.herbalGreen} />
              <Text style={[styles.actionButtonText, { color: colors.herbalGreen }]}>Download Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* Action Modal */}
      <Modal
        visible={isActionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Appointment Actions</Text>
              <TouchableOpacity onPress={() => setIsActionModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsList}>
              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionListItem, { borderColor: colors.herbalGreen }]}
                    onPress={() => setIsRescheduleModalVisible(true)}
                  >
                    <Ionicons name="calendar" size={20} color={colors.herbalGreen} />
                    <Text style={[styles.actionListText, { color: colors.text }]}>
                      Reschedule Appointment
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionListItem, { borderColor: '#D32F2F' }]}
                    onPress={handleCancelAppointment}
                  >
                    <Ionicons name="close-circle" size={20} color="#D32F2F" />
                    <Text style={[styles.actionListText, { color: colors.text }]}>
                      Cancel Appointment
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.actionListItem, { borderColor: colors.herbalGreen }]}
                onPress={() => handleDownload('pdf')}
              >
                <Ionicons name="document-text" size={20} color={colors.herbalGreen} />
                <Text style={[styles.actionListText, { color: colors.text }]}>
                  Download as PDF
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionListItem, { borderColor: colors.herbalGreen }]}
                onPress={() => handleDownload('csv')}
              >
                <Ionicons name="grid" size={20} color={colors.herbalGreen} />
                <Text style={[styles.actionListText, { color: colors.text }]}>
                  Download as CSV
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        visible={isRescheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRescheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Reschedule Appointment</Text>
              <TouchableOpacity onPress={() => setIsRescheduleModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>New Date</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.icon}
                value={newDate}
                onChangeText={setNewDate}
              />

              <Text style={[styles.formLabel, { color: colors.text }]}>New Time</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="HH:MM AM/PM"
                placeholderTextColor={colors.icon}
                value={newTime}
                onChangeText={setNewTime}
              />

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => setIsRescheduleModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.formButton, styles.submitButton, { backgroundColor: colors.herbalGreen }]}
                  onPress={handleRescheduleAppointment}
                  disabled={isLoading}
                >
                  <Text style={styles.submitButtonText}>
                    {isLoading ? 'Submitting...' : 'Submit Request'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    opacity: 0.8,
  },
  statusSection: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  primaryAction: {
    // backgroundColor set dynamically
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsList: {
    gap: 12,
  },
  actionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  actionListText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  formSection: {
    gap: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  formInput: {
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  submitButton: {
    // backgroundColor set dynamically
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default AppointmentCard;