import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { AppointmentService, AppointmentData } from '@/src/services/appointment';
import { DoctorService, Doctor } from '@/src/services/doctor';
import { surveyApi, prakritiApi } from '@/src/services/api';
import { PatientService, PatientProfile } from '@/src/services/patient';

export default function BookAppointmentScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { doctorId } = useLocalSearchParams();
  const { patient, isAuthenticated, isLoading } = useAuth();
  
  // Doctor state
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isDoctorLoading, setIsDoctorLoading] = useState(true);
  
  // Redirect if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !patient)) {
      Alert.alert(
        'Authentication Required',
        'Please log in to book an appointment.',
        [{ text: 'OK', onPress: () => router.replace('/auth' as any) }]
      );
      return;
    }
  }, [isAuthenticated, patient, isLoading]);

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) {
        Alert.alert('Error', 'No doctor selected. Please go back and select a doctor.');
        router.back();
        return;
      }

      try {
        setIsDoctorLoading(true);
        const doctorData = await DoctorService.getDoctorById(doctorId as string);
        setDoctor(doctorData);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        Alert.alert(
          'Error',
          'Failed to load doctor information. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setIsDoctorLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(true);
  
  // Patient profile and Prakriti data
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [prakritiData, setPrakritiData] = useState<any>(null);
  
  // Additional patient details - initialize with stored data if available
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState(patient?.medicalHistory || '');
  const [allergies, setAllergies] = useState(patient?.allergies || '');
  const [currentMedications, setCurrentMedications] = useState(patient?.currentMedications || '');
  const [lifestyle, setLifestyle] = useState('');
  const [consultationType, setConsultationType] = useState('general');
  const [emergencyContact, setEmergencyContact] = useState(patient?.emergencyContact || '');
  const [age, setAge] = useState(patient?.age || '');
  const [gender, setGender] = useState(patient?.gender || '');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Fetch comprehensive patient data for authenticated users
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!isAuthenticated || !patient) return;
      
      try {
        setIsLoadingPatientData(true);
        
        // Fetch patient profile
        const profileResponse = await PatientService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const profile = profileResponse.data;
          setPatientProfile(profile);
          
          // Pre-populate form fields with profile data (only if not already set)
          if (profile.age && !age) setAge(profile.age.toString());
          if (profile.weight && !weight) setWeight(profile.weight.toString());
          if (profile.height && !height) setHeight(profile.height.toString());
          if (profile.lifestyle && !lifestyle) setLifestyle(profile.lifestyle);
          if (profile.allergies && profile.allergies.length > 0 && !allergies) {
            setAllergies(profile.allergies.join(', '));
          }
          if (profile.healthConditions && profile.healthConditions.length > 0) {
            if (!medicalHistory) {
              setMedicalHistory(profile.healthConditions.join(', '));
            }
          }
        }
        
        // Fetch Prakriti assessment data
        const prakritiResponse = await prakritiApi.getCurrentPrakriti();
        if (prakritiResponse.success && prakritiResponse.data) {
          setPrakritiData(prakritiResponse.data);
        }
        
        // Also try to get survey data for any missing information
        const surveyResponse = await surveyApi.getSurveyStatus();
        if (surveyResponse.success && surveyResponse.data?.surveyData) {
          const surveyData = surveyResponse.data.surveyData;
          
          // Fill in any missing data from survey
          if (!age && surveyData.age) setAge(surveyData.age.toString());
          if (!weight && surveyData.weight) setWeight(surveyData.weight.toString());
          if (!height && surveyData.height) setHeight(surveyData.height.toString());
          if (!lifestyle && surveyData.lifestyle) setLifestyle(surveyData.lifestyle);
        }
        
      } catch (error) {
        console.error('Error fetching patient data:', error);
        // Don't show error to user, just use default values
      } finally {
        setIsLoadingPatientData(false);
      }
    };

    fetchPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, patient]); // Intentionally omitting form state variables

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

  // Show loading or don't render if not authenticated
  if (isLoading || isDoctorLoading || isLoadingPatientData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.herbalGreen} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {isLoading ? 'Loading...' : 
             isDoctorLoading ? 'Loading doctor information...' : 
             'Loading patient data...'}
          </Text>
        </View>
      </ThemedView>
    );
  }

  // Don't render if patient is not authenticated or doctor not found
  if (!isAuthenticated || !patient || !doctor) {
    return null;
  }

  const handlePayment = () => {
    // Validate all required fields
    if (!selectedDate || !selectedTime || !paymentMethod) {
      Alert.alert('Missing Information', 'Please fill in all appointment details.');
      return;
    }
    
    if (!symptoms.trim()) {
      Alert.alert('Missing Information', 'Please describe your symptoms or reason for consultation.');
      return;
    }
    
    if (!age.trim() || !gender.trim()) {
      Alert.alert('Missing Information', 'Please provide your age and gender.');
      return;
    }
    
    // Validate contact information
    if (!patient.phone && !emergencyContact.trim()) {
      Alert.alert('Missing Information', 'Please provide an emergency contact number since your profile doesn\'t have a phone number.');
      return;
    }
    
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!patient) {
      Alert.alert('Error', 'Patient information not found. Please log in again.');
      return;
    }

    if (paymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      Alert.alert('Payment Error', 'Please fill in all card details.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create appointment data
      const appointmentData: AppointmentData = {
        patientId: patient._id,
        doctorId: doctorId as string,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization || 'General Consultation',
        consultationFee: doctor.consultationFee || 500,
        date: selectedDate,
        time: selectedTime,
        patientDetails: {
          name: patient.name,
          email: patient.email,
          phone: patient.phone || emergencyContact || '', // Use emergency contact as fallback
          age: age,
          gender: gender,
          emergencyContact: emergencyContact,
        },
        consultationDetails: {
          type: consultationType,
          symptoms: symptoms,
          medicalHistory: medicalHistory,
          currentMedications: currentMedications,
          allergies: allergies,
          lifestyle: lifestyle,
          weight: weight,
          height: height,
        },
        paymentMethod: paymentMethod,
        paymentStatus: 'paid',
        appointmentId: `APT${Date.now()}`,
      };

      // Create appointment using real API
      const createdAppointment = await AppointmentService.createAppointment(appointmentData);
      
      setIsProcessing(false);
      setShowPaymentModal(false);
      
      Alert.alert(
        'Appointment Booked Successfully!',
        `Your appointment with ${doctor.name} has been confirmed for ${new Date(selectedDate).toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} at ${selectedTime}.\n\nAppointment ID: ${createdAppointment.appointmentId}\n\nNote: Diet recommendations will be available after your consultation is completed.`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => {
              router.replace('/dashboard' as any);
            },
          },
        ]
      );
    } catch (error) {
      setIsProcessing(false);
      console.error('Error creating appointment:', error);
      
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(
        'Booking Failed',
        `There was an error booking your appointment: ${errorMessage}. Please try again.`,
        [
          {
            text: 'OK',
            onPress: () => setShowPaymentModal(false),
          },
        ]
      );
    }
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
                {doctor.specialization || 'General Consultation'}
              </Text>
              <Text style={[styles.clinic, { color: colors.icon }]}>{doctor.location || 'Ayurveda Center'}</Text>
              <Text style={[styles.fee, { color: colors.softOrange }]}>
                Consultation Fee: ₹{doctor.consultationFee || 500}
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
              <Text style={[styles.infoText, { color: colors.text }]}>{patient?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={16} color={colors.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{patient?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={colors.icon} />
              <Text style={[styles.infoText, { color: colors.text }]}>{patient?.phone || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Comprehensive Patient Health Profile */}
        {(patientProfile || prakritiData) && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Patient Health Profile</Text>
            
            {/* Health Overview */}
            {patientProfile && (
              <View style={styles.healthOverview}>
                <Text style={[styles.subsectionTitle, { color: colors.herbalGreen }]}>Health Overview</Text>
                
                <View style={styles.healthGrid}>
                  {patientProfile.age && (
                    <View style={styles.healthItem}>
                      <Ionicons name="person-outline" size={16} color={colors.icon} />
                      <Text style={[styles.healthLabel, { color: colors.icon }]}>Age:</Text>
                      <Text style={[styles.healthValue, { color: colors.text }]}>{patientProfile.age} years</Text>
                    </View>
                  )}
                  
                  {patientProfile.weight && (
                    <View style={styles.healthItem}>
                      <Ionicons name="fitness-outline" size={16} color={colors.icon} />
                      <Text style={[styles.healthLabel, { color: colors.icon }]}>Weight:</Text>
                      <Text style={[styles.healthValue, { color: colors.text }]}>{patientProfile.weight} kg</Text>
                    </View>
                  )}
                  
                  {patientProfile.height && (
                    <View style={styles.healthItem}>
                      <Ionicons name="resize-outline" size={16} color={colors.icon} />
                      <Text style={[styles.healthLabel, { color: colors.icon }]}>Height:</Text>
                      <Text style={[styles.healthValue, { color: colors.text }]}>{patientProfile.height} cm</Text>
                    </View>
                  )}
                  
                  {patientProfile.lifestyle && (
                    <View style={styles.healthItem}>
                      <Ionicons name="bicycle-outline" size={16} color={colors.icon} />
                      <Text style={[styles.healthLabel, { color: colors.icon }]}>Lifestyle:</Text>
                      <Text style={[styles.healthValue, { color: colors.text }]}>{patientProfile.lifestyle}</Text>
                    </View>
                  )}
                </View>

                {/* Allergies */}
                {patientProfile.allergies && patientProfile.allergies.length > 0 && (
                  <View style={styles.healthDetailSection}>
                    <View style={styles.healthDetailHeader}>
                      <Ionicons name="warning-outline" size={16} color={colors.softOrange} />
                      <Text style={[styles.healthDetailTitle, { color: colors.softOrange }]}>Allergies</Text>
                    </View>
                    <Text style={[styles.healthDetailText, { color: colors.text }]}>
                      {patientProfile.allergies.join(', ')}
                    </Text>
                  </View>
                )}

                {/* Health Conditions */}
                {patientProfile.healthConditions && patientProfile.healthConditions.length > 0 && (
                  <View style={styles.healthDetailSection}>
                    <View style={styles.healthDetailHeader}>
                      <Ionicons name="medical-outline" size={16} color={colors.herbalGreen} />
                      <Text style={[styles.healthDetailTitle, { color: colors.herbalGreen }]}>Health Conditions</Text>
                    </View>
                    <Text style={[styles.healthDetailText, { color: colors.text }]}>
                      {patientProfile.healthConditions.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Prakriti Assessment Results */}
            {prakritiData && prakritiData.prakritiCompleted && prakritiData.currentPrakriti && (
              <View style={styles.prakritiSection}>
                <Text style={[styles.subsectionTitle, { color: colors.herbalGreen }]}>Ayurvedic Constitution (Prakriti)</Text>
                
                <View style={styles.prakritiResults}>
                  <View style={styles.prakritiPrimary}>
                    <Ionicons name="leaf-outline" size={20} color={colors.herbalGreen} />
                    <Text style={[styles.prakritiPrimaryText, { color: colors.herbalGreen }]}>
                      Primary: {prakritiData.currentPrakriti.primaryDosha}
                    </Text>
                  </View>
                  
                  {prakritiData.currentPrakriti.secondaryDosha && (
                    <View style={styles.prakritiSecondary}>
                      <Text style={[styles.prakritiSecondaryText, { color: colors.icon }]}>
                        Secondary: {prakritiData.currentPrakriti.secondaryDosha}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.prakritiInfo}>
                    <Ionicons name="information-circle-outline" size={14} color={colors.icon} />
                    <Text style={[styles.prakritiInfoText, { color: colors.icon }]}>
                      Assessment completed on {new Date(prakritiData.currentPrakriti.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Survey Status */}
            <View style={styles.surveyStatus}>
              <Ionicons 
                name={patientProfile?.surveyCompleted ? "checkmark-circle" : "time-outline"} 
                size={16} 
                color={patientProfile?.surveyCompleted ? colors.herbalGreen : colors.softOrange} 
              />
              <Text style={[styles.surveyStatusText, { 
                color: patientProfile?.surveyCompleted ? colors.herbalGreen : colors.softOrange 
              }]}>
                Health Survey: {patientProfile?.surveyCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>
        )}

        {/* Additional Patient Details */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Details</Text>
          
          <View style={styles.formRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Age *</Text>
              <TextInput
                style={[styles.formInput, { borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Enter age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholderTextColor={colors.icon}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Gender *</Text>
              <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      gender === option && { backgroundColor: colors.herbalGreen },
                      { borderColor: colors.inputBorder }
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <Text style={[
                      styles.genderText,
                      { color: gender === option ? 'white' : colors.text }
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Emergency Contact</Text>
            <TextInput
              style={[styles.formInput, { borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Emergency contact number"
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              keyboardType="phone-pad"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Weight (kg)</Text>
              <TextInput
                style={[styles.formInput, { borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Enter weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholderTextColor={colors.icon}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Height (cm)</Text>
              <TextInput
                style={[styles.formInput, { borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Enter height"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholderTextColor={colors.icon}
              />
            </View>
          </View>
        </View>

        {/* Consultation Details */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Consultation Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Consultation Type</Text>
            <View style={styles.consultationTypes}>
              {[
                { id: 'general', label: 'General Consultation' },
                { id: 'followup', label: 'Follow-up' },
                { id: 'emergency', label: 'Emergency' },
                { id: 'wellness', label: 'Wellness Check' }
              ].map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.consultationType,
                    consultationType === type.id && { backgroundColor: colors.lightGreen },
                    { borderColor: colors.inputBorder }
                  ]}
                  onPress={() => setConsultationType(type.id)}
                >
                  <Text style={[
                    styles.consultationTypeText,
                    { color: consultationType === type.id ? colors.herbalGreen : colors.text }
                  ]}>
                    {type.label}
                  </Text>
                  {consultationType === type.id && (
                    <Ionicons name="checkmark-circle" size={16} color={colors.herbalGreen} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Symptoms / Reason for Visit *</Text>
            <TextInput
              style={[styles.formTextArea, { borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Describe your symptoms, concerns, or reason for consultation..."
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Medical History</Text>
            <TextInput
              style={[styles.formTextArea, { borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Previous illnesses, surgeries, chronic conditions..."
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Current Medications</Text>
            <TextInput
              style={[styles.formInput, { borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="List any medications you're currently taking..."
              value={currentMedications}
              onChangeText={setCurrentMedications}
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Allergies</Text>
            <TextInput
              style={[styles.formInput, { borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Food allergies, drug allergies, etc..."
              value={allergies}
              onChangeText={setAllergies}
              placeholderTextColor={colors.icon}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Lifestyle Information</Text>
            <TextInput
              style={[styles.formTextArea, { borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Diet preferences, exercise routine, sleep patterns, stress levels..."
              value={lifestyle}
              onChangeText={setLifestyle}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor={colors.icon}
            />
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
            <Text style={styles.bookButtonText}>Confirm Booking - ₹{doctor.consultationFee || 500}</Text>
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
                  {isProcessing ? 'Processing...' : `Pay ₹${doctor.consultationFee || 500}`}
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
  // New styles for additional form fields
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  formTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    minHeight: 80,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  genderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  consultationTypes: {
    gap: 8,
  },
  consultationType: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  consultationTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  
  // Patient Health Profile Styles
  healthOverview: {
    marginTop: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  healthGrid: {
    gap: 8,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  healthLabel: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 60,
  },
  healthValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  healthDetailSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  healthDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  healthDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthDetailText: {
    fontSize: 13,
    lineHeight: 18,
  },
  prakritiSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  prakritiResults: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(62, 142, 90, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3E8E5A',
  },
  prakritiPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  prakritiPrimaryText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  prakritiSecondary: {
    marginLeft: 28,
    marginBottom: 6,
  },
  prakritiSecondaryText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  prakritiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 28,
  },
  prakritiInfoText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  surveyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  surveyStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
