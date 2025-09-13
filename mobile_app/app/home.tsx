import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { HelloWave } from '@/src/components/common/HelloWave';
import ParallaxScrollView from '@/src/components/common/ParallaxScrollView';
import { ThemedText } from '@/src/components/common/ThemedText';
import { ThemedView } from '@/src/components/common/ThemedView';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f8fffe', dark: '#1a1a1a' }}
      headerImage={
        <ThemedView style={styles.headerContent}>
          <View style={[styles.logoContainer, { backgroundColor: colors.herbalGreen }]}>
            <Ionicons name="leaf" size={36} color="white" />
          </View>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>AyurAhaar</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.icon }]}>
            Personalized wellness made simple
          </ThemedText>
        </ThemedView>
      }>
      
      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="title" style={styles.welcomeTitle}>
          Hello there
        </ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.actionsGrid}>
        {/* Primary Action */}
        <TouchableOpacity 
          style={[styles.primaryCard, { backgroundColor: colors.herbalGreen }]}
          onPress={() => router.push('/auth?mode=login')}
        >
          <Ionicons name="log-in" size={28} color="white" />
          <ThemedText style={styles.primaryCardTitle}>Get Started</ThemedText>
          <ThemedText style={styles.primaryCardSubtitle}>Sign in to access your wellness plan</ThemedText>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <View style={styles.secondaryGrid}>
          <TouchableOpacity 
            style={[styles.secondaryCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => router.push('/explore')}
          >
            <Ionicons name="restaurant" size={24} color={colors.softOrange} />
            <ThemedText style={[styles.secondaryCardTitle, { color: colors.text }]}>
              Explore Foods
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryCard, { backgroundColor: colors.cardBackground }]}
            onPress={() => router.push('/auth?mode=register')}
          >
            <Ionicons name="person-add" size={24} color={colors.herbalGreen} />
            <ThemedText style={[styles.secondaryCardTitle, { color: colors.text }]}>
              Register
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Minimal Info Section */}
      <ThemedView style={styles.infoContainer}>
        <ThemedText style={[styles.infoText, { color: colors.icon }]}>
          Ancient Ayurvedic wisdom meets modern nutrition science to create your perfect wellness plan.
        </ThemedText>
      </ThemedView>
      
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
  },
  actionsGrid: {
    gap: 20,
    marginBottom: 40,
  },
  primaryCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryCardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  primaryCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(62, 142, 90, 0.05)',
    marginTop: 8,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});