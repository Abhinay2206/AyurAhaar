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
  ActivityIndicator,
} from 'react-native';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Food, FoodService } from '@/src/services/food';

export default function FoodDetailsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { foodId } = useLocalSearchParams<{ foodId: string }>();
  
  const [food, setFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFoodDetails = async () => {
      if (!foodId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await FoodService.getFoodById(foodId);
        if (response.success && response.data) {
          setFood(response.data);
        } else {
          setError(response.error || 'Failed to load food details');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (foodId) {
      loadFoodDetails();
    }
  }, [foodId]);

  const loadFoodDetails = async () => {
    if (!foodId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await FoodService.getFoodById(foodId);
      if (response.success && response.data) {
        setFood(response.data);
      } else {
        setError(response.error || 'Failed to load food details');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDoshaColor = (doshaValue: string): string => {
    if (!doshaValue) return colors.icon;
    const lower = doshaValue.toLowerCase();
    
    if (lower.includes('beneficial') || lower.includes('pacify') || 
        lower.includes('good') || lower.includes('balance') || 
        lower.includes('reduce') || lower.includes('calm') ||
        lower.includes('decrease') || lower.includes('lower')) {
      return colors.herbalGreen;
    }
    
    if (lower.includes('aggravate') || lower.includes('increase') || 
        lower.includes('worsen') || lower.includes('elevate') ||
        lower.includes('provoke') || lower.includes('excess')) {
      return colors.softOrange;
    }
    
    return colors.icon;
  };

  const getDoshaIcon = (doshaValue: string): string => {
    if (!doshaValue) return 'help-circle';
    const lower = doshaValue.toLowerCase();
    
    if (lower.includes('beneficial') || lower.includes('pacify') || 
        lower.includes('good') || lower.includes('balance') || 
        lower.includes('reduce') || lower.includes('calm') ||
        lower.includes('decrease') || lower.includes('lower')) {
      return 'checkmark-circle';
    }
    
    if (lower.includes('aggravate') || lower.includes('increase') || 
        lower.includes('worsen') || lower.includes('elevate') ||
        lower.includes('provoke') || lower.includes('excess')) {
      return 'close-circle';
    }
    
    return 'help-circle';
  };

  const formatDoshaText = (doshaValue: string): string => {
    if (!doshaValue) return 'Unknown';
    
    const lower = doshaValue.toLowerCase();
    
    if (lower.includes('beneficial') || lower.includes('pacify') || 
        lower.includes('good') || lower.includes('balance') || 
        lower.includes('reduce') || lower.includes('calm') ||
        lower.includes('decrease') || lower.includes('lower')) {
      return 'Pacifies';
    }
    
    if (lower.includes('aggravate') || lower.includes('increase') || 
        lower.includes('worsen') || lower.includes('elevate') ||
        lower.includes('provoke') || lower.includes('excess')) {
      return 'Increases';
    }
    
    return doshaValue.length > 20 ? doshaValue.substring(0, 20) + '...' : doshaValue;
  };

  const getCategoryIcon = (category: string): string => {
    if (!category) return 'nutrition-outline';
    const cat = category.toLowerCase();
    if (cat.includes('fruit')) return 'leaf-outline';
    if (cat.includes('vegetable')) return 'flower-outline';
    if (cat.includes('grain') || cat.includes('cereal')) return 'apps-outline';
    if (cat.includes('spice')) return 'flame-outline';
    if (cat.includes('dairy')) return 'water-outline';
    if (cat.includes('meat') || cat.includes('fish')) return 'fish-outline';
    if (cat.includes('oil')) return 'ellipse-outline';
    return 'nutrition-outline';
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <AyurvedaPattern />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.herbalGreen} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Food Details</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.herbalGreen} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading food details...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error || !food) {
    return (
      <ThemedView style={styles.container}>
        <AyurvedaPattern />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.herbalGreen} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Food Details</Text>
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.softOrange} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load details</Text>
          <Text style={[styles.errorMessage, { color: colors.icon }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.herbalGreen }]}
            onPress={loadFoodDetails}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const nutrition = FoodService.formatNutrition(food);
  const doshaCompatibility = FoodService.getDoshaCompatibility(food);
  const healthTags = FoodService.getHealthTags(food);

  return (
    <ThemedView style={styles.container}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.herbalGreen} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Food Details</Text>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Food Title Card */}
        <View style={[styles.titleCard, { backgroundColor: colors.cardBackground }]}>
          <LinearGradient
            colors={[colors.herbalGreen + '15', colors.softOrange + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleGradient}
          />
          <View style={styles.titleHeader}>
            <View style={[styles.foodIcon, { backgroundColor: colors.herbalGreen + '20' }]}>
              <Ionicons 
                name={getCategoryIcon(food.category || '') as any} 
                size={32} 
                color={colors.herbalGreen} 
              />
            </View>
            <View style={styles.titleInfo}>
              <Text style={[styles.foodName, { color: colors.text }]}>{food.name_en}</Text>
              {food.vernacular_names && (
                <Text style={[styles.vernacularName, { color: colors.icon }]}>
                  {food.vernacular_names}
                </Text>
              )}
              {food.category && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.herbalGreen + '15' }]}>
                  <Text style={[styles.categoryText, { color: colors.herbalGreen }]}>
                    {food.category}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Nutrition Info */}
        {nutrition && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={24} color={colors.herbalGreen} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nutrition Facts</Text>
            </View>
            <Text style={[styles.nutritionText, { color: colors.icon }]}>Per 100g serving</Text>
            <Text style={[styles.nutritionValues, { color: colors.text }]}>{nutrition}</Text>
          </View>
        )}

        {/* Dosha Effects */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={24} color={colors.herbalGreen} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Dosha Effects</Text>
          </View>
          <View style={styles.doshaGrid}>
            {(['vata', 'pitta', 'kapha'] as const).map((dosha) => (
              <View key={dosha} style={[styles.doshaCard, { backgroundColor: colors.background }]}>
                <Text style={[styles.doshaName, { color: colors.text }]}>
                  {dosha.toUpperCase()}
                </Text>
                <View style={styles.doshaEffect}>
                  <Ionicons
                    name={getDoshaIcon(doshaCompatibility[dosha]) as any}
                    size={20}
                    color={getDoshaColor(doshaCompatibility[dosha])}
                  />
                  <Text style={[
                    styles.doshaText, 
                    { color: getDoshaColor(doshaCompatibility[dosha]) }
                  ]}>
                    {formatDoshaText(doshaCompatibility[dosha])}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Ayurvedic Properties */}
        {(food.ayurveda_rasa || food.ayurveda_virya || food.ayurveda_vipaka || food.ayurveda_guna) && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flower" size={24} color={colors.herbalGreen} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ayurvedic Properties</Text>
            </View>
            <View style={styles.propertyGrid}>
              {food.ayurveda_rasa && (
                <View style={styles.propertyItem}>
                  <Text style={[styles.propertyLabel, { color: colors.icon }]}>Rasa (Taste)</Text>
                  <Text style={[styles.propertyValue, { color: colors.text }]}>{food.ayurveda_rasa}</Text>
                </View>
              )}
              {food.ayurveda_virya && (
                <View style={styles.propertyItem}>
                  <Text style={[styles.propertyLabel, { color: colors.icon }]}>Virya (Potency)</Text>
                  <Text style={[styles.propertyValue, { color: colors.text }]}>{food.ayurveda_virya}</Text>
                </View>
              )}
              {food.ayurveda_vipaka && (
                <View style={styles.propertyItem}>
                  <Text style={[styles.propertyLabel, { color: colors.icon }]}>Vipaka (Post-digestive)</Text>
                  <Text style={[styles.propertyValue, { color: colors.text }]}>{food.ayurveda_vipaka}</Text>
                </View>
              )}
              {food.ayurveda_guna && (
                <View style={styles.propertyItem}>
                  <Text style={[styles.propertyLabel, { color: colors.icon }]}>Guna (Qualities)</Text>
                  <Text style={[styles.propertyValue, { color: colors.text }]}>{food.ayurveda_guna}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Health Benefits */}
        {healthTags.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical" size={24} color={colors.herbalGreen} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Benefits</Text>
            </View>
            <View style={styles.tagsContainer}>
              {healthTags.map((tag, index) => (
                <View key={index} style={[styles.healthTag, { backgroundColor: colors.softOrange + '15' }]}>
                  <Text style={[styles.healthTagText, { color: colors.softOrange }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Medical Usage */}
        {food.medical_usage && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medical-outline" size={24} color={colors.herbalGreen} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Medicinal Uses</Text>
            </View>
            <Text style={[styles.detailText, { color: colors.text }]}>{food.medical_usage}</Text>
          </View>
        )}

        {/* Preparation Methods */}
        {food.preparation_methods && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={24} color={colors.herbalGreen} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Preparation Methods</Text>
            </View>
            <Text style={[styles.detailText, { color: colors.text }]}>{food.preparation_methods}</Text>
          </View>
        )}

        {/* Contraindications */}
        {food.contraindications && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={24} color={colors.softOrange} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contraindications</Text>
            </View>
            <Text style={[styles.detailText, { color: colors.text }]}>{food.contraindications}</Text>
          </View>
        )}

        {/* Storage & Shelf Life */}
        {food.storage_shelf_life && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="archive" size={24} color={colors.herbalGreen} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Storage & Shelf Life</Text>
            </View>
            <Text style={[styles.detailText, { color: colors.text }]}>{food.storage_shelf_life}</Text>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  titleGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  titleHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  foodIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vernacularName: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  nutritionText: {
    fontSize: 14,
    marginBottom: 8,
  },
  nutritionValues: {
    fontSize: 16,
    fontWeight: '500',
  },
  doshaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doshaCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doshaName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  doshaEffect: {
    alignItems: 'center',
  },
  doshaText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  propertyGrid: {
    gap: 12,
  },
  propertyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  propertyLabel: {
    fontSize: 14,
    flex: 1,
  },
  propertyValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  healthTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  healthTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
});