import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.lightGreen, dark: '#1D3D47' }}
      headerImage={
        <ThemedView style={styles.headerContent}>
          <Ionicons name="leaf" size={48} color={colors.herbalGreen} />
          <ThemedText style={styles.headerTitle}>Ayurahaar</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Your Personal Wellness Journey</ThemedText>
        </ThemedView>
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Ayurahaar!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Start Your Wellness Journey</ThemedText>
        <ThemedText>
          Get a personalized Ayurvedic diet plan based on your unique health profile and lifestyle.
        </ThemedText>
        
        <TouchableOpacity 
          style={[styles.surveyButton, { backgroundColor: colors.herbalGreen }]}
          onPress={() => router.push('/survey')}
        >
          <Ionicons name="clipboard-outline" size={24} color="white" />
          <ThemedText style={styles.surveyButtonText}>Take Health Survey</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">How It Works</ThemedText>
        <ThemedText>
          1. Complete our comprehensive health survey{'\n'}
          2. Get your personalized Ayurvedic constitution analysis{'\n'}
          3. Receive a customized diet plan with meal recommendations{'\n'}
          4. Track your progress and adjust as needed
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Features</ThemedText>
        <ThemedText>
          • Personalized Ayurvedic diet recommendations{'\n'}
          • Seasonal meal planning{'\n'}
          • Ingredient substitutions for allergies{'\n'}
          • Progress tracking and wellness insights{'\n'}
          • Expert-curated recipes and meal plans
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#3E8E5A',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
    color: '#2C5F41',
  },
  surveyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  surveyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
