import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { AppointmentService, Appointment } from '@/src/services/appointment';
import { PlanService, PlanData } from '@/src/services/plan';
import { PatientService, PatientProfile } from '@/src/services/patient';
import { prakritiApi } from '@/src/services/api';
import { useNotification } from '@/src/contexts/NotificationContext';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { patient, getToken } = useAuth();
  const { scheduleAppointmentReminder } = useNotification();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [currentPrakriti, setCurrentPrakriti] = useState<any>(null);
  const [isLoadingPrakriti, setIsLoadingPrakriti] = useState(true);
  const [isGeneratingAIPlan, setIsGeneratingAIPlan] = useState(false);
  const scheduledAppointmentIds = useRef<Set<string>>(new Set());
  const [isResettingPlan, setIsResettingPlan] = useState(false);
  
  // New state for daily task tracking
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  
  // Always show Day 1 of the plan (when patient starts the AI plan)
  const currentPlanDay = 'day1'; // Always start with Day 1

  // Calculate days since plan started
  const getDaysSincePlanStart = (planStartDate: string) => {
    const start = new Date(planStartDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 7); // Cap at 7 days for weekly plan
  };

  // Helper function to toggle task completion
  const toggleTask = (taskId: string) => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
    } else {
      newCompletedTasks.add(taskId);
    }
    setCompletedTasks(newCompletedTasks);
  };

  // Navigation functions
  const handleViewFullPlan = () => {
    router.push('/full-plan-details' as any);
  };

  const handleViewPrakritiAssessment = () => {
    router.push('/view-prakriti' as any);
  };

  const handleViewBodyConstitution = () => {
    router.push('/body-constitution' as any);
  };

  const fetchCurrentPrakriti = async () => {
    try {
      setIsLoadingPrakriti(true);
      const response = await prakritiApi.getCurrentPrakriti();
      if (response.success && response.data?.currentPrakriti) {
        setCurrentPrakriti(response.data.currentPrakriti);
      }
    } catch (error) {
      console.error('Error fetching Prakriti:', error);
    } finally {
      setIsLoadingPrakriti(false);
    }
  };

  // Use patient profile data if available, fallback to auth context, then to default
  const displayPatient = useMemo(() => {
    const getConstitutionString = () => {
      if (currentPrakriti) {
        const { primaryDosha, secondaryDosha, isDual } = currentPrakriti;
        if (isDual && secondaryDosha) {
          return `${primaryDosha}-${secondaryDosha}`;
        }
        return primaryDosha;
      }
      return 'Unknown';
    };

    if (patientProfile) {
      return {
        name: patientProfile.name,
        constitution: getConstitutionString(),
        _id: patientProfile._id
      };
    }
    return patient || { name: 'User', constitution: getConstitutionString() };
  }, [patientProfile, patient, currentPrakriti]);

  // Debug patient data
  useEffect(() => {
    console.log('📱 Dashboard - Patient data:', patient);
    console.log('📱 Dashboard - Patient profile:', patientProfile);
    console.log('📱 Dashboard - Display patient:', displayPatient);
  }, [patient, patientProfile, displayPatient]);

  // Fetch patient profile data
  const fetchPatientProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      console.log('👤 Fetching patient profile...');
      
      // Check if we have a token first
      const token = await getToken();
      if (!token) {
        console.log('❌ No auth token found');
        setIsLoadingProfile(false);
        return;
      }
      
      const response = await PatientService.getProfile();
      if (response.success && response.data) {
        console.log('👤 Received patient profile:', response.data);
        setPatientProfile(response.data);
      } else {
        console.log('❌ Failed to fetch patient profile:', response.error);
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [getToken]);

  // Fetch real appointment data and plan data
  const fetchAppointments = useCallback(async () => {
    console.log('🔄 Fetching appointments for patient:', patient?._id, 'patientProfile:', patientProfile?._id);
    const patientId = patient?._id || patientProfile?._id;
    if (!patientId) {
      console.log('❌ No patient ID found');
      setIsLoadingAppointments(false);
      return;
    }

    try {
      setIsLoadingAppointments(true);
      console.log('📞 Calling AppointmentService.getPatientAppointments with ID:', patientId);
      const appointments = await AppointmentService.getPatientAppointments(patientId);
      console.log('📅 Received appointments:', appointments.length, appointments);
      
      // Filter for upcoming appointments (exclude cancelled) and sort by date
      const upcoming = appointments
        .filter(apt => {
          const isUpcoming = new Date(apt.date) >= new Date();
          const isNotCancelled = apt.status !== 'cancelled';
          console.log(`📋 Appointment ${apt._id}: upcoming=${isUpcoming}, not cancelled=${isNotCancelled}, status=${apt.status}, date=${apt.date}`);
          return isUpcoming && isNotCancelled;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log('✅ Filtered upcoming appointments:', upcoming.length, upcoming);
      setUpcomingAppointments(upcoming);

      // Schedule notification reminders for upcoming appointments (only once per appointment)
      for (const appointment of upcoming) {
        if (!scheduledAppointmentIds.current.has(appointment._id)) {
          try {
            await scheduleAppointmentReminder(
              appointment._id,
              new Date(appointment.date),
              appointment.doctorName || 'Doctor'
            );
            scheduledAppointmentIds.current.add(appointment._id);
            console.log('🔔 Scheduled reminder for appointment:', appointment._id);
          } catch (error) {
            console.error('❌ Failed to schedule reminder for appointment:', appointment._id, error);
          }
        } else {
          console.log('⏭️ Skipping already scheduled appointment:', appointment._id);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      // Keep empty array on error
      setUpcomingAppointments([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [patient?._id, patientProfile?._id, scheduleAppointmentReminder]);

  const fetchPlanData = useCallback(async () => {
    const patientId = patient?._id || patientProfile?._id;
    if (!patientId) {
      setIsLoadingPlan(false);
      return;
    }

    try {
      setIsLoadingPlan(true);
      console.log('📊 Fetching plan data for patient:', patientId);
      const planData = await PlanService.getCurrentPlan(patientId);
      console.log('📊 Received plan data:', planData);
      setCurrentPlan(planData);
    } catch (error) {
      console.error('Error fetching plan data:', error);
      // Set to null if error (no plan available)
      setCurrentPlan(null);
    } finally {
      setIsLoadingPlan(false);
    }
  }, [patient?._id, patientProfile?._id]);

  useEffect(() => {
    fetchPatientProfile();
    fetchAppointments();
    fetchPlanData();
    fetchCurrentPrakriti();
  }, [fetchPatientProfile, fetchAppointments, fetchPlanData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (patient?._id) {
        fetchPatientProfile();
        fetchAppointments();
        fetchPlanData();
        fetchCurrentPrakriti();
      }
    }, [fetchPatientProfile, fetchAppointments, fetchPlanData, patient?._id])
  );

  const handleAppointments = () => {
    router.push('/appointments' as any);
  };

  const handleProfile = () => {
    router.push('/profile' as any);
  };

  const handleChatbot = () => {
    router.push('/chatbot' as any);
  };

  const handleAyurvedaInfo = () => {
    router.push('/ayurveda-info' as any);
  };

  const handleGenerateAIPlan = async () => {
    if (!patient?._id && !patientProfile?._id) {
      Alert.alert('Error', 'Please login again to continue.');
      return;
    }

    try {
      setIsGeneratingAIPlan(true);
      
      Alert.alert(
        'Generate AI Plan',
        'This will create a personalized Ayurvedic meal plan based on your survey responses and Prakriti assessment. This may take a few moments.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Generate Plan',
            onPress: async () => {
              try {
                const patientId = patient?._id || patientProfile?._id;
                if (!patientId) {
                  Alert.alert('Error', 'Patient ID not found. Please login again.');
                  return;
                }
                
                await PlanService.generateAIPlan(patientId);
                
                Alert.alert(
                  'Success!',
                  'Your personalized AI meal plan has been generated successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Refresh the dashboard data to show the new plan
                        fetchPatientProfile();
                        fetchPlanData();
                      },
                    }
                  ]
                );
              } catch (error) {
                console.error('AI plan generation error:', error);
                Alert.alert(
                  'Error',
                  'Failed to generate AI plan. Please try again later.',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error preparing AI plan generation:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsGeneratingAIPlan(false);
    }
  };

  const handleResetPlan = async () => {
    if (!patient?._id && !patientProfile?._id) {
      Alert.alert('Error', 'Please login again to continue.');
      return;
    }

    Alert.alert(
      'Reset Plan',
      'Are you sure you want to reset your current meal plan? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset Plan',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResettingPlan(true);
              
              const patientId = patient?._id || patientProfile?._id;
              if (!patientId) {
                Alert.alert('Error', 'Patient ID not found. Please login again.');
                return;
              }
              
              await PlanService.resetPlan(patientId);
              
              Alert.alert(
                'Success!',
                'Your meal plan has been reset successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Refresh the dashboard data to show no plan
                      fetchPatientProfile();
                      fetchPlanData();
                    },
                  }
                ]
              );
            } catch (error) {
              console.error('Plan reset error:', error);
              Alert.alert(
                'Error',
                'Failed to reset plan. Please try again later.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsResettingPlan(false);
            }
          }
        }
      ]
    );
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
              {t('dashboard.welcome')},
            </ThemedText>
            <ThemedText style={[styles.userName, { color: colors.text }]}>
              {displayPatient.name}
            </ThemedText>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.exploreButton} 
            onPress={() => router.push('/explore')}
          >
            <Ionicons name="restaurant" size={28} color={colors.herbalGreen} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.infoButton} 
            onPress={handleAyurvedaInfo}
          >
            <Ionicons name="information-circle" size={28} color={colors.herbalGreen} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
            <Ionicons name="person-circle" size={32} color={colors.herbalGreen} />
          </TouchableOpacity>
        </View>
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
                {currentPlan.planType === 'ai' ? 'AI Generated' : 
                 currentPlan.planType === 'meal-plan' ? 'Custom Meal Plan' : 
                 'Doctor Prescribed'} • {(displayPatient as any).constitution || 'Vata-Pitta'}
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

      {/* Plan Section - Only show if patient has an active plan */}
      {isLoadingPlan ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading plan...</Text>
        </View>
      ) : currentPlan && currentPlan.planType !== 'none' ? (
        <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
          {/* Prakriti Section */}
          <View style={[styles.prakritiCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🧘‍♀️ Your Prakriti
            </Text>
            <Text style={[styles.prakritiType, { color: colors.herbalGreen }]}>
              {currentPlan.planType === 'ai' && currentPlan.plan?.aiPlan?.prakriti 
                ? currentPlan.plan.aiPlan.prakriti 
                : (displayPatient as any).constitution || 'Unknown'}
            </Text>
            
            {/* Action buttons container */}
            <View style={styles.prakritiButtonsContainer}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { 
                  borderColor: colors.herbalGreen, 
                  flex: 1, 
                  marginRight: 8,
                  marginTop: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  minHeight: 42
                }]}
                onPress={handleViewPrakritiAssessment}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.herbalGreen }]}>
                  View Assessment
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.primaryButton, { 
                  backgroundColor: colors.herbalGreen, 
                  flex: 1, 
                  marginLeft: 8,
                  minHeight: 42
                }]}
                onPress={handleViewBodyConstitution}
              >
                <Ionicons name="body-outline" size={16} color="white" style={{ marginRight: 6 }} />
                <Text style={[styles.primaryButtonText, { color: 'white' }]}>
                  Body Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Plan Section */}
          {currentPlan.planType === 'ai' && currentPlan.plan?.aiPlan ? (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                📅 Day 1 Plan - Your Journey Begins
              </Text>
              {/* Day 1 Meals */}
              {currentPlan.plan.aiPlan.weekly_plan && currentPlan.plan.aiPlan.weekly_plan[currentPlanDay] && (
                <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.mealTitle, { color: colors.text }]}>
                    🍽️ Day 1 Meals
                  </Text>
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                    const meal = currentPlan.plan.aiPlan.weekly_plan[currentPlanDay][mealType];
                    if (meal) {
                      const taskId = `meal-${mealType}-day1`;
                      // Handle both string and array formats
                      const mealItems = Array.isArray(meal) ? meal : [meal];
                      
                      return (
                        <View key={mealType} style={styles.mealSection}>
                          <TouchableOpacity
                            style={styles.taskItem}
                            onPress={() => toggleTask(taskId)}
                          >
                            <Ionicons 
                              name={completedTasks.has(taskId) ? "checkmark-circle" : "ellipse-outline"} 
                              size={24} 
                              color={completedTasks.has(taskId) ? colors.herbalGreen : colors.icon} 
                            />
                            <View style={styles.taskContent}>
                              <Text style={[
                                styles.taskTitle, 
                                { color: colors.text },
                                completedTasks.has(taskId) && styles.completedTask
                              ]}>
                                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                              </Text>
                              <View style={styles.foodItemsContainer}>
                                {mealItems.map((item: string, index: number) => (
                                  <Text 
                                    key={index} 
                                    style={[
                                      styles.foodItem, 
                                      { color: colors.icon },
                                      completedTasks.has(taskId) && styles.completedTask
                                    ]}
                                  >
                                    • {item}
                                  </Text>
                                ))}
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
              )}

              {/* Daily Recommendations - Separate Section */}
              {currentPlan.plan.aiPlan.recommendations && currentPlan.plan.aiPlan.recommendations.length > 0 && (
                <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.mealTitle, { color: colors.text }]}>
                    ✨ Daily Recommendations
                  </Text>
                  <Text style={[styles.mealDescription, { color: colors.icon, marginBottom: 12 }]}>
                    Follow these guidelines throughout your Ayurvedic journey:
                  </Text>
                  {currentPlan.plan.aiPlan.recommendations.map((rec: string, index: number) => {
                    const taskId = `rec-${index}`;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.taskItem}
                        onPress={() => toggleTask(taskId)}
                      >
                        <Ionicons 
                          name={completedTasks.has(taskId) ? "checkmark-circle" : "ellipse-outline"} 
                          size={24} 
                          color={completedTasks.has(taskId) ? colors.herbalGreen : colors.icon} 
                        />
                        <View style={styles.taskContent}>
                          <Text style={[
                            styles.taskDescription, 
                            { color: colors.text },
                            completedTasks.has(taskId) && styles.completedTask
                          ]}>
                            {rec}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.primaryActionButton, { backgroundColor: colors.herbalGreen }]}
                  onPress={handleViewFullPlan}
                >
                  <Ionicons name="calendar-outline" size={20} color="white" />
                  <Text style={styles.primaryActionButtonText}>View Full Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resetActionButton, { borderColor: colors.softOrange }]}
                  onPress={handleResetPlan}
                  disabled={isResettingPlan}
                >
                  <Ionicons name="refresh-outline" size={20} color={colors.softOrange} />
                  <Text style={[styles.resetActionButtonText, { color: colors.softOrange }]}>
                    {isResettingPlan ? 'Resetting...' : 'Reset Plan'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : currentPlan.planType === 'meal-plan' && currentPlan.plan?.mealPlanDetails ? (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
                📅 Day 1 Meal Plan - {currentPlan.plan.mealPlanDetails.title}
              </Text>
              {/* Day 1 Meals from Custom Meal Plan */}
              {currentPlan.plan.mealPlanDetails.mealPlan && currentPlan.plan.mealPlanDetails.mealPlan.day1 && (
                <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.mealTitle, { color: colors.text }]}>
                    🍽️ Day 1 Meals
                  </Text>
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => {
                    const meal = currentPlan.plan.mealPlanDetails.mealPlan.day1[mealType];
                    if (meal && meal.length > 0) {
                      const taskId = `meal-${mealType}-day1`;
                      
                      return (
                        <View key={mealType} style={styles.mealSection}>
                          <TouchableOpacity
                            style={styles.taskItem}
                            onPress={() => toggleTask(taskId)}
                          >
                            <Ionicons 
                              name={completedTasks.has(taskId) ? "checkmark-circle" : "ellipse-outline"} 
                              size={24} 
                              color={completedTasks.has(taskId) ? colors.herbalGreen : colors.icon} 
                            />
                            <View style={styles.taskContent}>
                              <Text style={[
                                styles.taskTitle, 
                                { color: colors.text },
                                completedTasks.has(taskId) && styles.completedTask
                              ]}>
                                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                              </Text>
                              <View style={styles.foodItemsContainer}>
                                {meal.map((foodItem: any, index: number) => (
                                  <Text 
                                    key={index} 
                                    style={[
                                      styles.foodItem, 
                                      { color: colors.icon },
                                      completedTasks.has(taskId) && styles.completedTask
                                    ]}
                                  >
                                    • {foodItem.name} ({foodItem.quantity}) - {foodItem.calories} cal
                                  </Text>
                                ))}
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    }
                    return null;
                  })}
                </View>
              )}

              {/* Nutrition Summary */}
              {currentPlan.plan.mealPlanDetails.nutritionSummary && (
                <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
                  <Text style={[styles.mealTitle, { color: colors.text }]}>
                    📊 Daily Nutrition Target
                  </Text>
                  <View style={styles.nutritionContainer}>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: colors.herbalGreen }]}>
                        {currentPlan.plan.mealPlanDetails.nutritionSummary.totalCalories}
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Calories</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: colors.softOrange }]}>
                        {currentPlan.plan.mealPlanDetails.nutritionSummary.protein}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: colors.herbalGreen }]}>
                        {currentPlan.plan.mealPlanDetails.nutritionSummary.carbs}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: colors.softOrange }]}>
                        {currentPlan.plan.mealPlanDetails.nutritionSummary.fats}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Fats</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Action Buttons for Meal Plan */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={[styles.primaryActionButton, { backgroundColor: colors.herbalGreen }]}
                  onPress={handleViewFullPlan}
                >
                  <Ionicons name="restaurant-outline" size={20} color="white" />
                  <Text style={styles.primaryActionButtonText}>View Full Meal Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.mealCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.mealDescription, { color: colors.icon }]}>
                {currentPlan.planType === 'ai' ? 
                  'Your personalized AI-generated meal plan is active.' : 
                  'Your doctor-prescribed plan is active.'}
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
          {/* Prakriti Section - Always show when no plan */}
          <View style={[styles.prakritiCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🧘‍♀️ Your Prakriti
            </Text>
            <Text style={[styles.prakritiType, { color: colors.herbalGreen }]}>
              {(displayPatient as any).constitution || 'Unknown'}
            </Text>
            
            {/* Action buttons container */}
            <View style={styles.prakritiButtonsContainer}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { 
                  borderColor: colors.herbalGreen, 
                  flex: 1, 
                  marginRight: 8,
                  marginTop: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  minHeight: 42
                }]}
                onPress={handleViewPrakritiAssessment}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.herbalGreen }]}>
                  View Assessment
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.primaryButton, { 
                  backgroundColor: colors.herbalGreen, 
                  flex: 1, 
                  marginLeft: 8,
                  minHeight: 42
                }]}
                onPress={handleViewBodyConstitution}
              >
                <Ionicons name="body-outline" size={16} color="white" style={{ marginRight: 6 }} />
                <Text style={[styles.primaryButtonText, { color: 'white' }]}>
                  Body Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* No Plan Card */}
          <View style={[styles.noPlanCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="nutrition-outline" size={80} color={colors.icon} />
            <Text style={[styles.noPlanTitle, { color: colors.text }]}>No Active Meal Plan</Text>
            <Text style={[styles.noPlanDescription, { color: colors.icon }]}>
              Start your Ayurvedic journey by generating a personalized AI meal plan or booking an appointment with our expert doctors.
            </Text>
            <View style={styles.noPlanActions}>
              <TouchableOpacity
                style={[styles.primaryActionButton, { backgroundColor: colors.herbalGreen }]}
                onPress={handleGenerateAIPlan}
                disabled={isGeneratingAIPlan}
              >
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.primaryActionButtonText}>
                  {isGeneratingAIPlan ? t('common.loading') : t('dashboard.generatePlan')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryActionButton, { borderColor: colors.herbalGreen }]}
                onPress={() => router.push('/doctor-list' as any)}
              >
                <Ionicons name="medical" size={20} color={colors.herbalGreen} />
                <Text style={[styles.secondaryActionButtonText, { color: colors.herbalGreen }]}>{t('dashboard.bookAppointment')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Appointments Section */}
      <View style={[styles.appointmentsSection, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.appointmentsHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            {t('dashboard.upcomingAppointments')}
          </ThemedText>
          <TouchableOpacity onPress={handleAppointments}>
            <Text style={[styles.viewAllText, { color: colors.herbalGreen }]}>{t('dashboard.viewPlan')}</Text>
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
              {t('dashboard.noAppointments')}
            </Text>
            <TouchableOpacity
              style={[styles.bookNowButton, { backgroundColor: colors.herbalGreen }]}
              onPress={() => router.push('/doctor-list' as any)}
            >
              <Text style={styles.bookNowButtonText}>{t('dashboard.bookAppointment')}</Text>
            </TouchableOpacity>
          </View>
        )}
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
        
        <TouchableOpacity style={styles.navItem} onPress={handleChatbot}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.icon} />
          <Text style={[styles.navLabel, { color: colors.icon }]}>Chat</Text>
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
    flex: 1,
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
    padding: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exploreButton: {
    padding: 1,
  },
  infoButton: {
    padding: 1,
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
  resetActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    marginTop: 12,
  },
  resetActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for enhanced dashboard
  prakritiCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  prakritiType: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  actionButtonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  mealSection: {
    marginBottom: 8,
  },
  foodItemsContainer: {
    marginTop: 4,
  },
  foodItem: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  prakritiButtonsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
