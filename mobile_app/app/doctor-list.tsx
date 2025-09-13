import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { DoctorService, Doctor } from '@/src/services/doctor';
import { PermissionsService } from '@/src/services/permissions';

const areas = [
  { label: 'All Areas', value: '' },
  { label: 'Hyderabad', value: 'hyderabad' },
  { label: 'Bangalore', value: 'bangalore' },
  { label: 'Chennai', value: 'chennai' },
  { label: 'Mumbai', value: 'mumbai' },
  { label: 'Delhi', value: 'delhi' },
  { label: 'Pune', value: 'pune' },
];

export default function DoctorListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedArea, setSelectedArea] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user's location
      const location = await PermissionsService.getCurrentLocation();
      
      let doctorsList: Doctor[];
      
      if (location) {
        // Search for nearby doctors
        doctorsList = await DoctorService.findNearbyDoctors({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        // Fallback to all doctors
        doctorsList = await DoctorService.getAllDoctors();
      }

      setDoctors(doctorsList);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDoctors = selectedArea 
    ? doctors.filter(doctor => doctor.location?.toLowerCase().includes(selectedArea.toLowerCase()))
    : doctors;

  const handleBookAppointment = (doctor: Doctor) => {
    router.push({
      pathname: '/book-appointment' as any,
      params: { doctorId: doctor._id }
    });
  };

  const handleRetry = () => {
    loadDoctors();
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.herbalGreen} />
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            Finding doctors near you...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.icon} />
          <ThemedText style={[styles.errorText, { color: colors.text }]}>
            {error}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.herbalGreen }]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (doctors.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="medical" size={64} color={colors.icon} />
          <ThemedText style={[styles.emptyText, { color: colors.text }]}>
            No doctors found in your area
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>
            Please try again later or contact support
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={[styles.doctorCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.doctorHeader}>
        <Text style={styles.doctorImage}>👨‍⚕️</Text>
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.specialization, { color: colors.herbalGreen }]}>
            {item.specialization || 'Ayurveda Specialist'}
          </Text>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color={colors.icon} />
            <Text style={[styles.area, { color: colors.icon }]}>
              {item.location || 'Location not specified'}
            </Text>
          </View>
          {item.experience && (
            <View style={styles.experienceInfo}>
              <Ionicons name="time" size={14} color={colors.icon} />
              <Text style={[styles.experience, { color: colors.icon }]}>
                {item.experience} years experience
              </Text>
            </View>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <View style={[styles.rating, { backgroundColor: colors.herbalGreen }]}>
            <Text style={styles.ratingText}>4.5</Text>
            <Ionicons name="star" size={12} color="white" />
          </View>
        </View>
      </View>
      
      <View style={styles.doctorDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={colors.icon} />
          <Text style={[styles.detailText, { color: colors.icon }]}>
            {item.experience} experience
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="card" size={16} color={colors.icon} />
          <Text style={[styles.detailText, { color: colors.icon }]}>
            ₹{item.consultationFee || 500} consultation
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => handleBookAppointment(item)}>
        <LinearGradient
          colors={[colors.herbalGreen, '#4A9D6A']}
          style={styles.bookButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

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
            Ayurveda Doctors
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
            Find certified doctors in Hyderabad
          </ThemedText>
        </View>
      </View>

      {/* Area Filter */}
      <View style={[styles.filterContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.filterHeader}>
          <Ionicons name="location" size={20} color={colors.herbalGreen} />
          <Text style={[styles.filterLabel, { color: colors.text }]}>Filter by Area</Text>
        </View>
        <RNPickerSelect
          onValueChange={setSelectedArea}
          items={areas}
          value={selectedArea}
          style={{
            inputIOS: [styles.picker, { color: colors.text, backgroundColor: colors.background }],
            inputAndroid: [styles.picker, { color: colors.text, backgroundColor: colors.background }],
          }}
          placeholder={{ label: 'Select area...', value: '' }}
        />
      </View>

      {/* Doctors List */}
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item._id}
        style={styles.doctorsList}
        contentContainerStyle={styles.doctorsListContent}
        showsVerticalScrollIndicator={false}
      />
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
  filterContainer: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  doctorsList: {
    flex: 1,
  },
  doctorsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  doctorCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorImage: {
    fontSize: 40,
    marginRight: 12,
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
    fontWeight: '600',
    marginBottom: 6,
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  clinicName: {
    fontSize: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  area: {
    fontSize: 12,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  doctorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  experienceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  experience: {
    fontSize: 12,
    marginLeft: 4,
  },
});
