import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Food, FoodService } from '@/src/services/food';

interface FoodCardProps {
  food: Food;
  onPress?: (food: Food) => void;
  style?: any;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onPress, style }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (onPress) {
      onPress(food);
    } else {
      // Default action - show detailed alert
      showFoodDetails();
    }
  };

  const showFoodDetails = () => {
    const nutrition = FoodService.formatNutrition(food);
    const doshaInfo = FoodService.getDoshaCompatibility(food);
    const healthTags = FoodService.getHealthTags(food);

    let message = `Category: ${food.category || 'Not specified'}\n\n`;
    
    if (nutrition) {
      message += `Nutrition (per 100g):\n${nutrition}\n\n`;
    }

    message += `Ayurveda Properties:\n`;
    message += `• Vata: ${doshaInfo.vata}\n`;
    message += `• Pitta: ${doshaInfo.pitta}\n`;
    message += `• Kapha: ${doshaInfo.kapha}\n\n`;

    if (food.ayurveda_rasa) {
      message += `Rasa (Taste): ${food.ayurveda_rasa}\n`;
    }
    if (food.ayurveda_virya) {
      message += `Virya (Potency): ${food.ayurveda_virya}\n`;
    }
    if (food.ayurveda_vipaka) {
      message += `Vipaka (Post-digestive effect): ${food.ayurveda_vipaka}\n`;
    }

    if (healthTags.length > 0) {
      message += `\nHealth Benefits:\n${healthTags.slice(0, 3).join(', ')}`;
    }

    if (food.medical_usage) {
      message += `\n\nMedicinal Uses:\n${food.medical_usage.substring(0, 200)}${food.medical_usage.length > 200 ? '...' : ''}`;
    }

    Alert.alert(
      food.name_en,
      message,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const getDoshaColor = (doshaValue: string): string => {
    if (!doshaValue) return colors.icon;
    const lower = doshaValue.toLowerCase();
    if (lower.includes('beneficial') || lower.includes('pacify') || lower.includes('good')) {
      return colors.herbalGreen;
    }
    if (lower.includes('aggravate') || lower.includes('increase')) {
      return colors.softOrange;
    }
    return colors.icon;
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

  const nutrition = FoodService.formatNutrition(food);
  const healthTags = FoodService.getHealthTags(food);
  const doshaCompatibility = FoodService.getDoshaCompatibility(food);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBackground }, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[colors.herbalGreen + '10', colors.softOrange + '05']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconContainer, { backgroundColor: colors.herbalGreen + '20' }]}>
            <Ionicons 
              name={getCategoryIcon(food.category || '') as any} 
              size={24} 
              color={colors.herbalGreen} 
            />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {food.name_en}
            </Text>
            {food.vernacular_names && (
              <Text style={[styles.vernacularName, { color: colors.icon }]} numberOfLines={1}>
                {food.vernacular_names}
              </Text>
            )}
          </View>
        </View>
        
        {food.category && (
          <View style={[styles.categoryBadge, { backgroundColor: colors.herbalGreen + '15' }]}>
            <Text style={[styles.categoryText, { color: colors.herbalGreen }]}>
              {food.category}
            </Text>
          </View>
        )}
      </View>

      {/* Nutrition Info */}
      {nutrition && (
        <View style={styles.nutritionContainer}>
          <Ionicons name="fitness-outline" size={16} color={colors.icon} />
          <Text style={[styles.nutritionText, { color: colors.icon }]}>
            {nutrition}
          </Text>
        </View>
      )}

      {/* Dosha Compatibility */}
      <View style={styles.doshaContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Dosha Effects:</Text>
        <View style={styles.doshaRow}>
          {(['vata', 'pitta', 'kapha'] as const).map((dosha) => (
            <View key={dosha} style={styles.doshaItem}>
              <Text style={[styles.doshaLabel, { color: colors.icon }]}>
                {dosha.toUpperCase()}
              </Text>
              <View style={styles.doshaIndicator}>
                <Ionicons
                  name={
                    doshaCompatibility[dosha].toLowerCase().includes('beneficial') ||
                    doshaCompatibility[dosha].toLowerCase().includes('pacify')
                      ? 'checkmark-circle'
                      : doshaCompatibility[dosha].toLowerCase().includes('aggravate')
                      ? 'close-circle'
                      : 'help-circle'
                  }
                  size={16}
                  color={getDoshaColor(doshaCompatibility[dosha])}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Health Tags */}
      {healthTags.length > 0 && (
        <View style={styles.tagsContainer}>
          <View style={styles.tagsRow}>
            {healthTags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: colors.softOrange + '15' }]}>
                <Text style={[styles.tagText, { color: colors.softOrange }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {healthTags.length > 3 && (
              <Text style={[styles.moreTagsText, { color: colors.icon }]}>
                +{healthTags.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.viewMoreButton} onPress={handlePress}>
          <Text style={[styles.viewMoreText, { color: colors.herbalGreen }]}>
            View Details
          </Text>
          <Ionicons name="arrow-forward" size={16} color={colors.herbalGreen} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  vernacularName: {
    fontSize: 14,
    marginTop: 2,
    fontStyle: 'italic',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nutritionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  nutritionText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  doshaContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  doshaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doshaItem: {
    alignItems: 'center',
    flex: 1,
  },
  doshaLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  doshaIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
});