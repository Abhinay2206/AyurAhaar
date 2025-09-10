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
} from 'react-native';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

// Dummy meal plan data
const weeklyMealPlan = {
  Monday: {
    breakfast: 'Oats with almonds and honey',
    lunch: 'Quinoa bowl with vegetables',
    dinner: 'Mung dal with rice',
    snack: 'Herbal tea with dates',
  },
  Tuesday: {
    breakfast: 'Warm milk with turmeric',
    lunch: 'Vegetable khichdi',
    dinner: 'Steamed vegetables with roti',
    snack: 'Fresh fruits',
  },
  Wednesday: {
    breakfast: 'Porridge with nuts',
    lunch: 'Lentil curry with rice',
    dinner: 'Vegetable soup',
    snack: 'Coconut water',
  },
  Thursday: {
    breakfast: 'Herbal tea with toast',
    lunch: 'Mixed vegetable curry',
    dinner: 'Light dal with chapati',
    snack: 'Seasonal fruits',
  },
  Friday: {
    breakfast: 'Smoothie bowl',
    lunch: 'Brown rice with curry',
    dinner: 'Grilled vegetables',
    snack: 'Green tea',
  },
  Saturday: {
    breakfast: 'Traditional breakfast',
    lunch: 'Regional specialty',
    dinner: 'Light and nutritious meal',
    snack: 'Healthy snack',
  },
  Sunday: {
    breakfast: 'Relaxed breakfast',
    lunch: 'Family meal',
    dinner: 'Comfort food',
    snack: 'Weekend treat',
  },
};

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
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = Object.keys(weeklyMealPlan);
  const currentMeals = weeklyMealPlan[selectedDay as keyof typeof weeklyMealPlan];

  const handleAppointments = () => {
    router.push('/appointments' as any);
  };

  const handleProfile = () => {
    router.push('/profile' as any);
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
              {currentPatient.name}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
          <Ionicons name="person-circle" size={32} color={colors.herbalGreen} />
        </TouchableOpacity>
      </View>

      {/* Plan Info Card */}
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
              {currentPatient.planType} • {currentPatient.constitution}
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

      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === day && { backgroundColor: colors.herbalGreen },
                { borderColor: colors.inputBorder }
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayText,
                selectedDay === day && styles.selectedDayText,
                { color: selectedDay === day ? 'white' : colors.text }
              ]}>
                {day.slice(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Meal Plan */}
      <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedDay} Meal Plan
        </Text>

        {/* Breakfast */}
        <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIcon, { backgroundColor: colors.lightOrange }]}>
              <Ionicons name="sunny" size={20} color={colors.softOrange} />
            </View>
            <Text style={[styles.mealTitle, { color: colors.text }]}>Breakfast</Text>
            <Text style={[styles.mealTime, { color: colors.icon }]}>8:00 AM</Text>
          </View>
          <Text style={[styles.mealDescription, { color: colors.icon }]}>
            {currentMeals.breakfast}
          </Text>
        </View>

        {/* Lunch */}
        <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIcon, { backgroundColor: colors.lightGreen }]}>
              <Ionicons name="restaurant" size={20} color={colors.herbalGreen} />
            </View>
            <Text style={[styles.mealTitle, { color: colors.text }]}>Lunch</Text>
            <Text style={[styles.mealTime, { color: colors.icon }]}>12:30 PM</Text>
          </View>
          <Text style={[styles.mealDescription, { color: colors.icon }]}>
            {currentMeals.lunch}
          </Text>
        </View>

        {/* Snack */}
        <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIcon, { backgroundColor: colors.lightOrange }]}>
              <Ionicons name="cafe" size={20} color={colors.softOrange} />
            </View>
            <Text style={[styles.mealTitle, { color: colors.text }]}>Snack</Text>
            <Text style={[styles.mealTime, { color: colors.icon }]}>4:00 PM</Text>
          </View>
          <Text style={[styles.mealDescription, { color: colors.icon }]}>
            {currentMeals.snack}
          </Text>
        </View>

        {/* Dinner */}
        <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIcon, { backgroundColor: colors.lightGreen }]}>
              <Ionicons name="moon" size={20} color={colors.herbalGreen} />
            </View>
            <Text style={[styles.mealTitle, { color: colors.text }]}>Dinner</Text>
            <Text style={[styles.mealTime, { color: colors.icon }]}>7:30 PM</Text>
          </View>
          <Text style={[styles.mealDescription, { color: colors.icon }]}>
            {currentMeals.dinner}
          </Text>
        </View>
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
});
