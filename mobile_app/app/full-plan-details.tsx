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
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Full Plan</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loadingContainer}>
          <View style={[styles.loadingCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="nutrition-outline" size={60} color={colors.herbalGreen} />
            <Text style={[styles.loadingTitle, { color: colors.text }]}>Loading Your Plan</Text>
            <Text style={[styles.loadingText, { color: colors.icon }]}>
              Preparing your personalized meal plan...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (!currentPlan || currentPlan.planType === 'none') {
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
          <View style={[styles.noPlanCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="nutrition-outline" size={80} color={colors.icon} />
            <Text style={[styles.noPlanTitle, { color: colors.text }]}>No Plan Available</Text>
            <Text style={[styles.noPlanDescription, { color: colors.icon }]}>
              Generate your personalized plan from the dashboard to view detailed meal plans and recommendations.
            </Text>
            <TouchableOpacity 
              style={[styles.generateButton, { backgroundColor: colors.herbalGreen }]}
              onPress={() => router.back()}
            >
              <Text style={styles.generateButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Check if we have valid plan data based on plan type
  const hasValidPlanData = 
    (currentPlan.planType === 'ai' && currentPlan.plan?.aiPlan) ||
    (currentPlan.planType === 'meal-plan' && currentPlan.plan?.mealPlanDetails) ||
    (currentPlan.planType === 'doctor' && currentPlan.plan);

  if (!hasValidPlanData) {
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
          <View style={[styles.noPlanCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="nutrition-outline" size={80} color={colors.icon} />
            <Text style={[styles.noPlanTitle, { color: colors.text }]}>Plan Data Not Available</Text>
            <Text style={[styles.noPlanDescription, { color: colors.icon }]}>
              {currentPlan.planType === 'ai' && 'AI plan data is missing. Please generate a new plan.'}
              {currentPlan.planType === 'meal-plan' && 'Meal plan details are missing. Please create a new meal plan.'}
              {currentPlan.planType === 'doctor' && 'Doctor plan data is missing. Please contact your doctor.'}
            </Text>
            <TouchableOpacity 
              style={[styles.generateButton, { backgroundColor: colors.herbalGreen }]}
              onPress={() => router.back()}
            >
              <Text style={styles.generateButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Get plan data based on type
  const planData = currentPlan.planType === 'ai' ? currentPlan.plan.aiPlan : 
                   currentPlan.planType === 'meal-plan' ? currentPlan.plan.mealPlanDetails :
                   currentPlan.plan;

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
          <View style={styles.planTypeIndicator}>
            <Text style={styles.planTypeEmoji}>
              {currentPlan.planType === 'ai' && '🧘‍♀️'}
              {currentPlan.planType === 'meal-plan' && '🍽️'}
              {currentPlan.planType === 'doctor' && '👨‍⚕️'}
            </Text>
          </View>
          
          <Text style={styles.planTitle}>
            {currentPlan.planType === 'ai' && (
              `${planData.prakriti || 'Ayurvedic'} Constitution Plan`
            )}
            {currentPlan.planType === 'meal-plan' && (
              planData.title || 'Custom Meal Plan'
            )}
            {currentPlan.planType === 'doctor' && (
              'Doctor Prescribed Plan'
            )}
          </Text>
          
          <Text style={styles.planSubtitle}>
            {currentPlan.planType === 'ai' && (
              `${planData.plan_type || 'Personalized'} • Generated ${planData.generated_at ? new Date(planData.generated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              }) : 'recently'}`
            )}
            {currentPlan.planType === 'meal-plan' && (
              `${planData.duration || 7} days • Target: ${planData.targetCalories || 2000} cal/day`
            )}
            {currentPlan.planType === 'doctor' && (
              'Professional medical guidance'
            )}
          </Text>
          
          <View style={styles.planStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentPlan.planType === 'meal-plan' ? planData.duration || 7 : 7}
              </Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentPlan.planType === 'meal-plan' ? 
                  (planData.duration || 7) * 4 : 21}
              </Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {currentPlan.planType === 'meal-plan' ? 
                  planData.targetCalories || '2000' : '100%'}
              </Text>
              <Text style={styles.statLabel}>
                {currentPlan.planType === 'meal-plan' ? 'Cal/Day' : 'Ayurvedic'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Enhanced Day Selector */}
      <View style={styles.daySelector}>
        <Text style={[styles.daySelectorTitle, { color: colors.text }]}>📅 Choose Day</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.dayScrollContainer}
          style={styles.dayScroll}
        >
          {dayNames.map((day, index) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  { 
                    borderColor: isSelected ? colors.herbalGreen : colors.inputBorder,
                    backgroundColor: isSelected ? colors.herbalGreen : colors.cardBackground 
                  }
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  { color: isSelected ? 'white' : colors.text }
                ]}>
                  {dayLabels[index]}
                </Text>
                {isSelected && <View style={styles.selectedDayIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Day Meals - AI Plan */}
        {currentPlan.planType === 'ai' && planData.weekly_plan && planData.weekly_plan[selectedDay] && (
          <View style={[styles.dayMealsContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, { color: colors.text }]}>
                📅 {dayLabels[dayNames.indexOf(selectedDay)]}
              </Text>
              <Text style={[styles.daySubtitle, { color: colors.icon }]}>
                Ayurvedic meals for your constitution
              </Text>
            </View>

            <View style={styles.mealsGrid}>
              {['breakfast', 'lunch', 'dinner'].map((mealType, index) => {
                const meal = planData.weekly_plan[selectedDay][mealType];
                if (!meal) return null;

                const mealItems = Array.isArray(meal) ? meal : [meal];
                const mealConfig = {
                  breakfast: { emoji: '🌅', name: 'Breakfast', colors: ['#FFF3E0', '#FFE0B2'] },
                  lunch: { emoji: '☀️', name: 'Lunch', colors: ['#E8F5E8', '#C8E6C9'] },
                  dinner: { emoji: '🌙', name: 'Dinner', colors: ['#E3F2FD', '#BBDEFB'] }
                } as const;

                const config = mealConfig[mealType as keyof typeof mealConfig];

                return (
                  <View key={mealType} style={styles.mealCard}>
                    <LinearGradient
                      colors={config.colors}
                      style={styles.mealCardHeader}
                    >
                      <Text style={styles.mealEmoji}>{config.emoji}</Text>
                      <Text style={[styles.mealName, { color: colors.text }]}>
                        {config.name}
                      </Text>
                    </LinearGradient>
                    
                    <View style={styles.mealCardContent}>
                      {mealItems.map((item: string, itemIndex: number) => (
                        <View key={itemIndex} style={styles.foodItemRow}>
                          <View style={[styles.foodBullet, { backgroundColor: colors.herbalGreen }]} />
                          <Text style={[styles.foodText, { color: colors.text }]}>
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Day Meals - Meal Plan */}
        {currentPlan.planType === 'meal-plan' && planData.mealPlan && planData.mealPlan[selectedDay] && (
          <View style={[styles.dayMealsContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, { color: colors.text }]}>
                📅 {dayLabels[dayNames.indexOf(selectedDay)]}
              </Text>
              <Text style={[styles.daySubtitle, { color: colors.icon }]}>
                Detailed meal plan with nutrition
              </Text>
            </View>

            <View style={styles.mealsGrid}>
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType, index) => {
                const meal = planData.mealPlan[selectedDay][mealType];
                if (!meal || meal.length === 0) return null;

                const mealConfig = {
                  breakfast: { emoji: '🌅', name: 'Breakfast', colors: ['#FFF3E0', '#FFE0B2'] },
                  lunch: { emoji: '☀️', name: 'Lunch', colors: ['#E8F5E8', '#C8E6C9'] },
                  dinner: { emoji: '🌙', name: 'Dinner', colors: ['#E3F2FD', '#BBDEFB'] },
                  snacks: { emoji: '🍎', name: 'Snacks', colors: ['#F3E5F5', '#E1BEE7'] }
                } as const;

                const config = mealConfig[mealType];

                return (
                  <View key={mealType} style={styles.mealCard}>
                    <LinearGradient
                      colors={config.colors}
                      style={styles.mealCardHeader}
                    >
                      <Text style={styles.mealEmoji}>{config.emoji}</Text>
                      <Text style={[styles.mealName, { color: colors.text }]}>
                        {config.name}
                      </Text>
                    </LinearGradient>                    <View style={styles.mealCardContent}>
                      {meal.map((foodItem: any, itemIndex: number) => (
                        <View key={itemIndex} style={styles.detailedFoodItem}>
                          <View style={styles.foodItemHeader}>
                            <Text style={[styles.foodItemName, { color: colors.text }]}>
                              {foodItem.name}
                            </Text>
                            <Text style={[styles.foodItemCalories, { color: colors.herbalGreen }]}>
                              {foodItem.calories} cal
                            </Text>
                          </View>
                          <View style={styles.foodItemDetails}>
                            <Text style={[styles.foodItemQuantity, { color: colors.icon }]}>
                              {foodItem.quantity}
                            </Text>
                            {(foodItem.protein > 0 || foodItem.carbs > 0 || foodItem.fats > 0) && (
                              <Text style={[styles.foodItemNutrition, { color: colors.icon }]}>
                                P: {foodItem.protein}g • C: {foodItem.carbs}g • F: {foodItem.fats}g
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Daily Nutrition Summary */}
            {planData.nutritionSummary && (
              <View style={[styles.nutritionSummaryCard, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.nutritionTitle, { color: colors.text }]}>
                  📊 Daily Nutrition
                </Text>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionStat}>
                    <Text style={[styles.nutritionValue, { color: colors.herbalGreen }]}>
                      {planData.nutritionSummary.totalCalories}
                    </Text>
                    <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Calories</Text>
                  </View>
                  <View style={styles.nutritionStat}>
                    <Text style={[styles.nutritionValue, { color: colors.softOrange }]}>
                      {planData.nutritionSummary.protein}g
                    </Text>
                    <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Protein</Text>
                  </View>
                  <View style={styles.nutritionStat}>
                    <Text style={[styles.nutritionValue, { color: colors.herbalGreen }]}>
                      {planData.nutritionSummary.carbs}g
                    </Text>
                    <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionStat}>
                    <Text style={[styles.nutritionValue, { color: colors.softOrange }]}>
                      {planData.nutritionSummary.fats}g
                    </Text>
                    <Text style={[styles.nutritionLabel, { color: colors.icon }]}>Fats</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Recommendations - AI Plan Only */}
        {currentPlan.planType === 'ai' && planData.recommendations && planData.recommendations.length > 0 && (
          <View style={[styles.recommendationsCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              ✨ Daily Recommendations
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
              Follow these guidelines throughout your Ayurvedic journey:
            </Text>
            
            {planData.recommendations.map((rec: string, index: number) => (
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
        {currentPlan.planType === 'ai' && planData.restrictions && planData.restrictions.length > 0 && (
          <View style={[styles.restrictionsCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🚫 Dietary Restrictions
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
              Avoid these items for optimal health:
            </Text>
            
            {planData.restrictions.map((restriction: string, index: number) => (
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
    alignItems: 'center',
  },
  planTypeIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planTypeEmoji: {
    fontSize: 32,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
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
    paddingHorizontal: 40,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noPlanCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
    marginBottom: 24,
  },
  generateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Additional styles for meal plan functionality
  mealHeader: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  foodItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  foodDetails: {
    marginLeft: 12,
    marginTop: 2,
  },
  foodQuantity: {
    fontSize: 12,
    fontWeight: '500',
  },
  foodNutrition: {
    fontSize: 11,
    marginTop: 1,
  },
  nutritionCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  // New improved styles
  dayScrollContainer: {
    paddingHorizontal: 8,
  },
  dayMealsContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dayHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  daySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  mealsGrid: {
    gap: 16,
  },
  mealCard: {
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
  },
  mealCardContent: {
    padding: 16,
    paddingTop: 0,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  foodBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  foodText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  detailedFoodItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  foodItemCalories: {
    fontSize: 14,
    fontWeight: '600',
  },
  foodItemDetails: {
    gap: 4,
  },
  foodItemQuantity: {
    fontSize: 13,
    fontWeight: '500',
  },
  foodItemNutrition: {
    fontSize: 12,
  },
  nutritionSummaryCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionStat: {
    alignItems: 'center',
    flex: 1,
  },
});