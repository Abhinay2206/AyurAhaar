import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { PlanService, PlanData } from '@/src/services/plan';
import { PatientService } from '@/src/services/patient';

export default function FullPlanDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('day1');

  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      setIsLoading(true);
      
      // Get patient profile first
      const profileResponse = await PatientService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        // Then get plan data
        const planResponse = await PlanService.getCurrentPlan(profileResponse.data._id);
        setCurrentPlan(planResponse);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
      Alert.alert('Error', 'Failed to load plan details');
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];
  const dayLabels = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AyurvedaPattern />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading your meal plan...</Text>
        </View>
      </View>
    );
  }

  if (!currentPlan || currentPlan.planType === 'none' || !currentPlan.plan?.aiPlan) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AyurvedaPattern />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Full Plan</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.noPlanContainer}>
          <Ionicons name="nutrition-outline" size={80} color={colors.icon} />
          <Text style={[styles.noPlanTitle, { color: colors.text }]}>No AI Plan Available</Text>
          <Text style={[styles.noPlanDescription, { color: colors.icon }]}>
            Generate your AI meal plan from the dashboard to view the full plan details.
          </Text>
        </View>
      </View>
    );
  }

  const aiPlan = currentPlan.plan.aiPlan;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Full Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Enhanced Plan Overview */}
      <LinearGradient
        colors={[colors.herbalGreen, '#4A9D6A']}
        style={styles.overviewCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overviewContent}>
          <Text style={styles.planTitle}>
            🧘‍♀️ {aiPlan.prakriti} Constitution Plan
          </Text>
          <Text style={styles.planSubtitle}>
            {aiPlan.plan_type} • Generated {new Date(aiPlan.generated_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>21</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Ayurvedic</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Enhanced Day Selector */}
      <View style={styles.daySelector}>
        <Text style={[styles.daySelectorTitle, { color: colors.text }]}>Select Day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          {dayNames.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                { 
                  borderColor: selectedDay === day ? colors.herbalGreen : colors.inputBorder,
                  backgroundColor: selectedDay === day ? colors.herbalGreen : colors.cardBackground 
                }
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayText,
                { color: selectedDay === day ? 'white' : colors.text }
              ]}>
                {dayLabels[index]}
              </Text>
              {selectedDay === day && (
                <View style={styles.selectedDayIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selected Day Meals */}
        {aiPlan.weekly_plan && aiPlan.weekly_plan[selectedDay] && (
          <View style={[styles.mealsCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.mealsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🍽️ {dayLabels[dayNames.indexOf(selectedDay)]} Meals
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
                Personalized for your constitution
              </Text>
            </View>
            
            {['breakfast', 'lunch', 'dinner'].map((mealType, mealIndex) => {
              const meal = aiPlan.weekly_plan[selectedDay][mealType];
              if (meal) {
                // Handle both string and array formats
                const mealItems = Array.isArray(meal) ? meal : [meal];
                
                return (
                  <View key={mealType} style={[
                    styles.mealItem,
                    mealIndex === 0 && styles.firstMealItem
                  ]}>
                    <LinearGradient
                      colors={mealType === 'breakfast' ? ['#FFE4B5', '#FFF8DC'] : 
                             mealType === 'lunch' ? ['#F0E68C', '#FFFACD'] : 
                             ['#E6E6FA', '#F8F8FF']}
                      style={styles.mealIconGradient}
                    >
                      <Text style={styles.mealEmoji}>
                        {mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '☀️' : '🌙'}
                      </Text>
                    </LinearGradient>
                    <View style={styles.mealContent}>
                      <Text style={[styles.mealTitle, { color: colors.text }]}>
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </Text>
                      <View style={styles.foodItemsList}>
                        {mealItems.map((item: string, index: number) => (
                          <View key={index} style={styles.foodItemContainer}>
                            <View style={[styles.foodItemBullet, { backgroundColor: colors.herbalGreen }]} />
                            <Text style={[styles.foodItemText, { color: colors.text }]}>
                              {item}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                );
              }
              return null;
            })}
          </View>
        )}

        {/* Recommendations */}
        {aiPlan.recommendations && aiPlan.recommendations.length > 0 && (
          <View style={[styles.recommendationsCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ✨ Daily Recommendations
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
              Follow these guidelines throughout your Ayurvedic journey:
            </Text>
            
            {aiPlan.recommendations.map((rec: string, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.herbalGreen }]} />
                <Text style={[styles.recommendationText, { color: colors.text }]}>
                  {rec}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Restrictions */}
        {aiPlan.restrictions && aiPlan.restrictions.length > 0 && (
          <View style={[styles.restrictionsCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🚫 Dietary Restrictions
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
              Avoid these items for optimal health:
            </Text>
            
            {aiPlan.restrictions.map((restriction: string, index: number) => (
              <View key={index} style={styles.restrictionItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.softOrange }]} />
                <Text style={[styles.restrictionText, { color: colors.text }]}>
                  {restriction}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Weekly Overview */}
        <View style={[styles.weeklyOverviewCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📅 Weekly Overview
          </Text>
          
          {dayNames.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.weeklyDayItem,
                { borderBottomColor: colors.inputBorder },
                selectedDay === day && { backgroundColor: colors.lightGreen }
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.weeklyDayLabel,
                { color: colors.text },
                selectedDay === day && { fontWeight: 'bold' }
              ]}>
                {dayLabels[index]}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={selectedDay === day ? colors.herbalGreen : colors.icon} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 44, // Reduced padding for status bar only
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  overviewCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewContent: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: 'white',
  },
  planSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  daySelector: {
    marginBottom: 20,
  },
  daySelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 20,
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
  selectedDayIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mealsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mealsHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  firstMealItem: {
    marginTop: 0,
  },
  mealIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealContent: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  foodItemsList: {
    marginTop: 4,
  },
  foodItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  foodItemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: 10,
  },
  foodItemText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  recommendationsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  restrictionsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restrictionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  weeklyOverviewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weeklyDayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  weeklyDayLabel: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noPlanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  noPlanDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});