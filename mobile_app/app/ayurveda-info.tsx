import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

export default function AyurvedaInfo() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const doshaInfo = [
    {
      name: 'Vata',
      element: 'Air + Space',
      characteristics: 'Movement, creativity, flexibility',
      qualities: 'Light, dry, cold, rough, moving',
      balancedTraits: 'Energetic, creative, adaptable, quick thinking',
      imbalancedTraits: 'Anxiety, restlessness, digestive issues, insomnia',
      foods: 'Warm, moist, grounding foods. Cooked grains, root vegetables, warm spices',
      icon: '🌬️',
      color: ['#E8F4FD', '#B3E5FC'],
    },
    {
      name: 'Pitta',
      element: 'Fire + Water',
      characteristics: 'Transformation, intelligence, focus',
      qualities: 'Hot, sharp, light, liquid, spreading',
      balancedTraits: 'Focused, intelligent, confident, good digestion',
      imbalancedTraits: 'Irritability, inflammation, acidity, skin issues',
      foods: 'Cool, sweet, bitter foods. Fresh fruits, leafy greens, cooling herbs',
      icon: '🔥',
      color: ['#FFF3E0', '#FFE0B2'],
    },
    {
      name: 'Kapha',
      element: 'Earth + Water',
      characteristics: 'Structure, stability, immunity',
      qualities: 'Heavy, slow, cool, moist, stable',
      balancedTraits: 'Calm, strong, patient, good immunity',
      imbalancedTraits: 'Sluggishness, weight gain, congestion, depression',
      foods: 'Light, warm, spicy foods. Legumes, vegetables, warming spices',
      icon: '🌍',
      color: ['#E8F5E8', '#C8E6C9'],
    },
  ];

  const ayurvedaPrinciples = [
    {
      title: 'Constitutional Assessment (Prakriti)',
      description: 'Your unique mind-body constitution determined at birth. Understanding your Prakriti helps choose foods and lifestyle practices that maintain natural balance.',
      icon: 'person-outline',
    },
    {
      title: 'Current State (Vikriti)',
      description: 'Your present state of health and any imbalances. May differ from your Prakriti due to lifestyle, diet, stress, or environment.',
      icon: 'pulse-outline',
    },
    {
      title: 'Digestive Fire (Agni)',
      description: 'The metabolic fire that transforms food into energy. Strong Agni ensures proper digestion, absorption, and elimination.',
      icon: 'flame-outline',
    },
    {
      title: 'Six Tastes (Rasa)',
      description: 'Sweet, sour, salty, pungent, bitter, astringent. Each taste affects the doshas differently and should be balanced in meals.',
      icon: 'restaurant-outline',
    },
    {
      title: 'Food Combining',
      description: 'Certain food combinations can disturb digestion. Ayurveda provides guidelines for optimal food pairing.',
      icon: 'nutrition-outline',
    },
    {
      title: 'Seasonal Eating',
      description: 'Adjusting diet according to seasons helps maintain doshic balance as external environment changes.',
      icon: 'leaf-outline',
    },
  ];

  const mealPlanningTips = [
    {
      title: 'Eat Mindfully',
      description: 'Focus on your meal without distractions. Chew thoroughly and eat at a moderate pace.',
    },
    {
      title: 'Regular Meal Times',
      description: 'Maintain consistent eating schedule to support digestive rhythm and metabolic balance.',
    },
    {
      title: 'Largest Meal at Noon',
      description: 'When digestive fire is strongest, eat your main meal. Light breakfast and dinner are ideal.',
    },
    {
      title: 'Fresh, Whole Foods',
      description: 'Choose seasonal, locally sourced, minimally processed foods for optimal nutrition and prana.',
    },
    {
      title: 'Warm, Cooked Foods',
      description: 'Generally easier to digest than cold, raw foods. Especially important for Vata constitution.',
    },
    {
      title: 'Include All Six Tastes',
      description: 'Each meal should ideally contain all six tastes to satisfy body and mind completely.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ayurveda Guide</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.herbalGreen, '#4A9D6A']}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>🕉️ Ancient Wisdom</Text>
          <Text style={styles.heroSubtitle}>
            Discover the 5,000-year-old science of Ayurveda and how it guides your personalized wellness journey
          </Text>
        </LinearGradient>

        {/* Introduction */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What is Ayurveda?</Text>
          <Text style={[styles.description, { color: colors.icon }]}>
            Ayurveda is a 5,000-year-old system of natural healing from India. It views each person as unique,
            with their own ideal state of balance. This app uses Ayurvedic principles to create personalized
            meal plans that support your individual constitution and current health needs.
          </Text>
        </View>

        {/* The Three Doshas */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>The Three Doshas</Text>
          <Text style={[styles.description, { color: colors.icon }]}>
            Doshas are biological energies that govern all physical and mental processes in the body.
          </Text>
          
          {doshaInfo.map((dosha, index) => (
            <LinearGradient
              key={index}
              colors={dosha.color as any}
              style={styles.doshaCard}
            >
              <View style={styles.doshaHeader}>
                <Text style={styles.doshaIcon}>{dosha.icon}</Text>
                <View>
                  <Text style={styles.doshaName}>{dosha.name}</Text>
                  <Text style={styles.doshaElement}>{dosha.element}</Text>
                </View>
              </View>
              
              <Text style={styles.doshaCharacteristics}>{dosha.characteristics}</Text>
              
              <View style={styles.doshaDetails}>
                <Text style={styles.detailLabel}>Qualities:</Text>
                <Text style={styles.detailText}>{dosha.qualities}</Text>
                
                <Text style={styles.detailLabel}>When Balanced:</Text>
                <Text style={styles.detailText}>{dosha.balancedTraits}</Text>
                
                <Text style={styles.detailLabel}>When Imbalanced:</Text>
                <Text style={styles.detailText}>{dosha.imbalancedTraits}</Text>
                
                <Text style={styles.detailLabel}>Recommended Foods:</Text>
                <Text style={styles.detailText}>{dosha.foods}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>

        {/* Ayurvedic Principles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Ayurvedic Principles</Text>
          
          {ayurvedaPrinciples.map((principle, index) => (
            <View key={index} style={[styles.principleCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.principleHeader}>
                <Ionicons name={principle.icon as any} size={24} color={colors.herbalGreen} />
                <Text style={[styles.principleTitle, { color: colors.text }]}>{principle.title}</Text>
              </View>
              <Text style={[styles.principleDescription, { color: colors.icon }]}>{principle.description}</Text>
            </View>
          ))}
        </View>

        {/* Meal Planning Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ayurvedic Meal Planning</Text>
          <Text style={[styles.description, { color: colors.icon }]}>
            These guidelines help optimize digestion and maintain doshic balance through mindful eating practices.
          </Text>
          
          {mealPlanningTips.map((tip, index) => (
            <View key={index} style={[styles.tipCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.herbalGreen }]}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
              <Text style={[styles.tipDescription, { color: colors.icon }]}>{tip.description}</Text>
            </View>
          ))}
        </View>

        {/* How This App Helps */}
        <LinearGradient
          colors={[colors.softOrange, '#f5576c']}
          style={styles.appHelpSection}
        >
          <Text style={styles.appHelpTitle}>How AyurAhaar Helps You</Text>
          <View style={styles.appFeature}>
            <Ionicons name="person-circle-outline" size={24} color="white" />
            <Text style={styles.appFeatureText}>
              Personalized assessment to determine your unique constitution (Prakriti)
            </Text>
          </View>
          <View style={styles.appFeature}>
            <Ionicons name="restaurant-outline" size={24} color="white" />
            <Text style={styles.appFeatureText}>
              AI-generated meal plans based on your dosha and current health needs
            </Text>
          </View>
          <View style={styles.appFeature}>
            <Ionicons name="leaf-outline" size={24} color="white" />
            <Text style={styles.appFeatureText}>
              Detailed food recommendations with Ayurvedic properties and benefits
            </Text>
          </View>
          <View style={styles.appFeature}>
            <Ionicons name="calendar-outline" size={24} color="white" />
            <Text style={styles.appFeatureText}>
              7-day meal plans that adapt to seasonal changes and your lifestyle
            </Text>
          </View>
        </LinearGradient>

        {/* Getting Started */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Getting Started</Text>
          <Text style={[styles.description, { color: colors.icon }]}>
            1. Complete the comprehensive Prakriti assessment to understand your constitution
            {'\n'}2. Generate your personalized AI meal plan
            {'\n'}3. Explore foods to understand their Ayurvedic properties
            {'\n'}4. Follow your plan and observe how different foods affect your energy and wellbeing
            {'\n'}5. Consult with qualified Ayurvedic practitioners for deeper guidance
          </Text>
          
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ This app provides educational information and general guidance based on Ayurvedic principles.
              Always consult healthcare professionals for medical conditions and before making significant dietary changes.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
  content: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  doshaCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doshaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  doshaIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  doshaName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  doshaElement: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  doshaCharacteristics: {
    fontSize: 16,
    color: '#444',
    marginBottom: 15,
    fontWeight: '500',
  },
  doshaDetails: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  principleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  principleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  principleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  principleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  appHelpSection: {
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appHelpTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  appFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  appFeatureText: {
    fontSize: 15,
    color: 'white',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  bottomPadding: {
    height: 30,
  },
});