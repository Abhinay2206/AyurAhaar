import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

// Dummy doctor data for Hyderabad
const doctorsData = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    specialization: 'Panchakarma & Detoxification',
    clinic: 'Ayurveda Wellness Center',
    area: 'Banjara Hills',
    experience: '12 years',
    rating: 4.8,
    consultationFee: 800,
    image: '👨‍⚕️',
  },
  {
    id: '2',
    name: 'Dr. Priya Sharma',
    specialization: 'Digestive Health & Nutrition',
    clinic: 'Holistic Ayurveda Clinic',
    area: 'Madhapur',
    experience: '15 years',
    rating: 4.9,
    consultationFee: 1000,
    image: '👩‍⚕️',
  },
  {
    id: '3',
    name: 'Dr. Venkatesh Reddy',
    specialization: 'Stress Management & Mental Wellness',
    clinic: 'Serenity Ayurveda Hospital',
    area: 'Secunderabad',
    experience: '10 years',
    rating: 4.7,
    consultationFee: 750,
    image: '👨‍⚕️',
  },
  {
    id: '4',
    name: 'Dr. Lakshmi Devi',
    specialization: 'Women\'s Health & Reproductive Wellness',
    clinic: 'Feminine Care Ayurveda',
    area: 'Jubilee Hills',
    experience: '18 years',
    rating: 4.9,
    consultationFee: 1200,
    image: '👩‍⚕️',
  },
  {
    id: '5',
    name: 'Dr. Suresh Babu',
    specialization: 'Joint Pain & Arthritis Treatment',
    clinic: 'Movement Ayurveda Center',
    area: 'Kukatpally',
    experience: '14 years',
    rating: 4.6,
    consultationFee: 900,
    image: '👨‍⚕️',
  },
  {
    id: '6',
    name: 'Dr. Kavitha Rao',
    specialization: 'Skin Care & Beauty Treatments',
    clinic: 'Radiant Skin Ayurveda',
    area: 'Hitech City',
    experience: '11 years',
    rating: 4.8,
    consultationFee: 850,
    image: '👩‍⚕️',
  },
];

const areas = [
  { label: 'All Areas', value: '' },
  { label: 'Banjara Hills', value: 'Banjara Hills' },
  { label: 'Madhapur', value: 'Madhapur' },
  { label: 'Secunderabad', value: 'Secunderabad' },
  { label: 'Jubilee Hills', value: 'Jubilee Hills' },
  { label: 'Kukatpally', value: 'Kukatpally' },
  { label: 'Hitech City', value: 'Hitech City' },
];

export default function DoctorListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedArea, setSelectedArea] = useState('');
  
  const filteredDoctors = selectedArea 
    ? doctorsData.filter(doctor => doctor.area === selectedArea)
    : doctorsData;

  const handleBookAppointment = (doctor: any) => {
    router.push({
      pathname: '/book-appointment' as any,
      params: { doctorId: doctor.id }
    });
  };

  const renderDoctorCard = ({ item }: { item: any }) => (
    <View style={[styles.doctorCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.doctorHeader}>
        <Text style={styles.doctorImage}>{item.image}</Text>
        <View style={styles.doctorInfo}>
          <Text style={[styles.doctorName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.specialization, { color: colors.herbalGreen }]}>
            {item.specialization}
          </Text>
          <View style={styles.clinicInfo}>
            <Ionicons name="business" size={14} color={colors.icon} />
            <Text style={[styles.clinicName, { color: colors.icon }]}>{item.clinic}</Text>
          </View>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color={colors.icon} />
            <Text style={[styles.area, { color: colors.icon }]}>{item.area}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <View style={[styles.rating, { backgroundColor: colors.herbalGreen }]}>
            <Text style={styles.ratingText}>{item.rating}</Text>
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
            ₹{item.consultationFee} consultation
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
        keyExtractor={(item) => item.id}
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
});
