import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';

import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

// Dummy patient data
const dummyPatients = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 9876543210',
    age: 28,
    address: 'Banjara Hills, Hyderabad',
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 9876543211',
    age: 32,
    address: 'Madhapur, Hyderabad',
  },
];

// Dummy doctor data (matching the IDs from doctor list)
const doctorsData = {
  '1': {
    name: 'Dr. Rajesh Kumar',
    specialization: 'Panchakarma & Detoxification',
    clinic: 'Ayurveda Wellness Center',
    area: 'Banjara Hills',
    consultationFee: 800,
  },
  '2': {
    name: 'Dr. Priya Sharma',
    specialization: 'Digestive Health & Nutrition',
    clinic: 'Holistic Ayurveda Clinic',
    area: 'Madhapur',
    consultationFee: 1000,
  },
  // Add other doctors as needed
};

export default function BookAppointmentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { doctorId } = useLocalSearchParams();
  
  // Use first dummy patient as default
  const currentPatient = dummyPatients[0];
  const doctor = (doctorsData as any)[doctorId as string] || (doctorsData as any)['1'];
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Available dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-IN', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handlePayment = () => {
    if (!selectedDate || !selectedTime || !paymentMethod) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      Alert.alert('Payment Error', 'Please fill in all card details.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      
      Alert.alert(
        'Appointment Booked!',
        'Your appointment has been successfully booked. You will receive a confirmation message shortly.',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/dashboard' as any),
          },
        ]
      );
    }, 2000);
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
            Book Appointment
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Schedule your consultation
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Info */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Doctor Details</Text>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorImage}>👨‍⚕️</Text>
            <View style={styles.doctorDetails}>
              <Text style={[styles.doctorName, { color: colors.text }]}>{doctor.name}</Text>
              <Text style={[styles.specialization, { color: colors.herbalGreen }]}>
                {doctor.specialization}
              </Text>
              <Text style={[styles.clinic, { color: colors.icon }]}>{doctor.clinic}</Text>
              <Text style={[styles.fee, { color: colors.softOrange }]}>
                Consultation Fee: ₹{doctor.consultationFee}
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Info */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Patient Information</Text>
          <View style={styles.patientInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={colors.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{currentPatient.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={16} color={colors.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{currentPatient.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={colors.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{currentPatient.phone}</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {availableDates.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateOption,
                  selectedDate === date.value && { backgroundColor: colors.herbalGreen },
                  { borderColor: colors.inputBorder }
                ]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text style={[
                  styles.dateText,
                  selectedDate === date.value && styles.selectedText,
                  { color: selectedDate === date.value ? 'white' : colors.text }
                ]}>
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  selectedTime === time && { backgroundColor: colors.herbalGreen },
                  { borderColor: colors.inputBorder }
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[
                  styles.timeText,
                  selectedTime === time && styles.selectedText,
                  { color: selectedTime === time ? 'white' : colors.text }
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            {[
              { id: 'card', label: 'Credit/Debit Card', icon: 'card' },
              { id: 'upi', label: 'UPI Payment', icon: 'phone-portrait' },
              { id: 'wallet', label: 'Digital Wallet', icon: 'wallet' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.paymentOption,
                  paymentMethod === option.id && { backgroundColor: colors.lightGreen },
                  { borderColor: colors.inputBorder }
                ]}
                onPress={() => setPaymentMethod(option.id)}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={paymentMethod === option.id ? colors.herbalGreen : colors.icon} 
                />
                <Text style={[
                  styles.paymentText,
                  { color: paymentMethod === option.id ? colors.herbalGreen : colors.text }
                ]}>
                  {option.label}
                </Text>
                {paymentMethod === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.herbalGreen} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity onPress={handlePayment} style={styles.bookButtonContainer}>
          <LinearGradient
            colors={[colors.herbalGreen, colors.softOrange]}
            style={styles.bookButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookButtonText}>Confirm Booking - ₹{doctor.consultationFee}</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Complete Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {paymentMethod === 'card' && (
              <View style={styles.cardForm}>
                <TextInput
                  style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
                  placeholder="Card Number"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={16}
                />
                <View style={styles.cardRow}>
                  <TextInput
                    style={[styles.input, styles.halfInput, { borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={setExpiryDate}
                    maxLength={5}
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput, { borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="CVV"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>
            )}

            {paymentMethod === 'upi' && (
              <View style={styles.upiForm}>
                <Text style={[styles.upiText, { color: colors.text }]}>
                  Scan the QR code or pay using UPI ID
                </Text>
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code" size={80} color={colors.icon} />
                </View>
              </View>
            )}

            {paymentMethod === 'wallet' && (
              <View style={styles.walletForm}>
                <Text style={[styles.walletText, { color: colors.text }]}>
                  Choose your preferred wallet
                </Text>
                {['PhonePe', 'Google Pay', 'Paytm'].map((wallet) => (
                  <TouchableOpacity key={wallet} style={[styles.walletOption, { borderColor: colors.inputBorder }]}>
                    <Text style={[styles.walletName, { color: colors.text }]}>{wallet}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity onPress={processPayment} disabled={isProcessing}>
              <LinearGradient
                colors={[colors.herbalGreen, colors.softOrange]}
                style={[styles.payButton, isProcessing && styles.disabledButton]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.payButtonText}>
                  {isProcessing ? 'Processing...' : `Pay ₹${doctor.consultationFee}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    fontSize: 40,
    marginRight: 16,
  },
  doctorDetails: {
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
    marginBottom: 2,
  },
  clinic: {
    fontSize: 12,
    marginBottom: 4,
  },
  fee: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  patientInfo: {
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
  dateScroll: {
    marginHorizontal: -4,
  },
  dateOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: 'bold',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: '22%',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  bookButtonContainer: {
    margin: 20,
    marginTop: 10,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  cardForm: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  upiForm: {
    alignItems: 'center',
    marginBottom: 20,
  },
  upiText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletForm: {
    marginBottom: 20,
  },
  walletText: {
    fontSize: 16,
    marginBottom: 16,
  },
  walletOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  walletName: {
    fontSize: 14,
    fontWeight: '500',
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
