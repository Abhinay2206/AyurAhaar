import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  ActivityIndicator,
} from 'react-native';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

export default function AIPlanGenerationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [progress] = useState(new Animated.Value(0));
  const [loadingText, setLoadingText] = useState('Analyzing your profile...');

  useEffect(() => {
    // Simulate AI plan generation process
    const steps = [
      { text: 'Analyzing your profile...', duration: 1500 },
      { text: 'Determining your Ayurvedic constitution...', duration: 2000 },
      { text: 'Selecting personalized ingredients...', duration: 1800 },
      { text: 'Creating your weekly meal plan...', duration: 2200 },
      { text: 'Finalizing recommendations...', duration: 1000 },
    ];

    let currentStep = 0;
    
    const runSteps = () => {
      if (currentStep < steps.length) {
        setLoadingText(steps[currentStep].text);
        
        // Animate progress bar
        Animated.timing(progress, {
          toValue: (currentStep + 1) / steps.length,
          duration: steps[currentStep].duration,
          useNativeDriver: false,
        }).start(() => {
          currentStep++;
          if (currentStep < steps.length) {
            setTimeout(runSteps, 300);
          } else {
            // Generation complete, navigate to dashboard
            setTimeout(() => {
              router.replace('/dashboard' as any);
            }, 1000);
          }
        });
      }
    };

    runSteps();
  }, [progress]);

  return (
    <ThemedView style={styles.container}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: colors.herbalGreen }]}>
          <Ionicons name="sparkles" size={32} color="white" />
        </View>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          AI Personalized Plan
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          We&apos;re creating your personalized Ayurveda meal plan
        </ThemedText>
      </View>

      {/* Loading Content */}
      <View style={styles.loadingContainer}>
        {/* Animated Loading Icon */}
        <View style={styles.animationContainer}>
          <LinearGradient
            colors={[colors.herbalGreen, '#4A9D6A']}
            style={styles.loadingIcon}
          >
            <ActivityIndicator size="large" color="white" />
          </LinearGradient>
          
          {/* Floating Icons */}
          <View style={styles.floatingIcons}>
            <Ionicons name="leaf" size={20} color={colors.herbalGreen} style={[styles.floatingIcon, styles.icon1]} />
            <Ionicons name="nutrition" size={18} color={colors.softOrange} style={[styles.floatingIcon, styles.icon2]} />
            <Ionicons name="restaurant" size={16} color={colors.herbalGreen} style={[styles.floatingIcon, styles.icon3]} />
            <Ionicons name="heart" size={14} color={colors.softOrange} style={[styles.floatingIcon, styles.icon4]} />
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: colors.inputBorder }]}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.herbalGreen,
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {loadingText}
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.herbalGreen} />
            <Text style={[styles.featureText, { color: colors.icon }]}>
              Personalized based on your constitution
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.herbalGreen} />
            <Text style={[styles.featureText, { color: colors.icon }]}>
              Traditional Ayurvedic principles
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.herbalGreen} />
            <Text style={[styles.featureText, { color: colors.icon }]}>
              Seasonal and regional ingredients
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.herbalGreen} />
            <Text style={[styles.featureText, { color: colors.icon }]}>
              Weekly meal plan with recipes
            </Text>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingIcons: {
    position: 'absolute',
    width: 140,
    height: 140,
    left: -20,
    top: -20,
  },
  floatingIcon: {
    position: 'absolute',
    opacity: 0.7,
  },
  icon1: {
    top: 10,
    right: 20,
  },
  icon2: {
    bottom: 10,
    left: 20,
  },
  icon3: {
    top: 40,
    left: 0,
  },
  icon4: {
    bottom: 40,
    right: 0,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresList: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
});
