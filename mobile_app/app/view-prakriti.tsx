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
import { PatientService, PatientProfile } from '@/src/services/patient';

export default function ViewPrakritiScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      setIsLoading(true);
      const response = await PatientService.getProfile();
      if (response.success && response.data) {
        setPatientProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      Alert.alert('Error', 'Failed to load Prakriti information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAssessment = () => {
    router.push('/comprehensive-survey' as any);
  };

  const handleRetakeAssessment = () => {
    Alert.alert(
      'Retake Assessment',
      'Are you sure you want to retake your Prakriti assessment? This will replace your current assessment.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retake', onPress: () => router.push('/comprehensive-survey' as any) }
      ]
    );
  };

  const handleBodyConstitution = () => {
    router.push('/body-constitution' as any);
  };

  const getDosha = (dosha: string) => {
    switch (dosha.toLowerCase()) {
      case 'vata':
        return { emoji: '💨', color: colors.herbalGreen, description: 'Air & Space - Movement, creativity, flexibility' };
      case 'pitta':
        return { emoji: '🔥', color: colors.softOrange, description: 'Fire & Water - Metabolism, intelligence, courage' };
      case 'kapha':
        return { emoji: '🌍', color: colors.herbalGreen, description: 'Earth & Water - Structure, stability, immunity' };
      default:
        return { emoji: '⚖️', color: colors.icon, description: 'Balanced constitution' };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AyurvedaPattern />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>Loading Prakriti information...</Text>
        </View>
      </View>
    );
  }

  const prakriti = (patientProfile as any)?.currentPrakriti;
  const primaryDosha = getDosha(prakriti?.primaryDosha || '');
  const secondaryDosha = prakriti?.secondaryDosha ? getDosha(prakriti.secondaryDosha) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your Prakriti</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {prakriti ? (
          <>
            {/* Prakriti Hero Card */}
            <LinearGradient
              colors={[colors.herbalGreen, '#4A9D6A']}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Your Ayurvedic Constitution</Text>
                <View style={styles.constitutionDisplay}>
                  <Text style={styles.heroEmoji}>{primaryDosha.emoji}</Text>
                  <View style={styles.constitutionInfo}>
                    <Text style={styles.primaryDoshaName}>{prakriti.primaryDosha}</Text>
                    {prakriti.isDual && secondaryDosha && (
                      <Text style={styles.secondaryDoshaName}>
                        with {secondaryDosha.emoji} {prakriti.secondaryDosha}
                      </Text>
                    )}
                    <Text style={styles.constitutionType}>
                      {prakriti.isDual ? 'Dual Constitution' : 'Single Constitution'}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Primary Dosha Details */}
            <View style={[styles.doshaDetailCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.doshaHeader}>
                <Text style={styles.doshaHeaderEmoji}>{primaryDosha.emoji}</Text>
                <View style={styles.doshaHeaderInfo}>
                  <Text style={[styles.doshaHeaderTitle, { color: colors.text }]}>
                    Primary Dosha: {prakriti.primaryDosha}
                  </Text>
                  <Text style={[styles.doshaHeaderSubtitle, { color: colors.icon }]}>
                    Your dominant constitution
                  </Text>
                </View>
              </View>
              <Text style={[styles.doshaDetailDescription, { color: colors.icon }]}>
                {primaryDosha.description}
              </Text>
            </View>

            {/* Secondary Dosha (if dual) */}
            {prakriti.isDual && secondaryDosha && (
              <View style={[styles.doshaDetailCard, { backgroundColor: colors.cardBackground }]}>
                <View style={styles.doshaHeader}>
                  <Text style={styles.doshaHeaderEmoji}>{secondaryDosha.emoji}</Text>
                  <View style={styles.doshaHeaderInfo}>
                    <Text style={[styles.doshaHeaderTitle, { color: colors.text }]}>
                      Secondary Dosha: {prakriti.secondaryDosha}
                    </Text>
                    <Text style={[styles.doshaHeaderSubtitle, { color: colors.icon }]}>
                      Your supportive constitution
                    </Text>
                  </View>
                </View>
                <Text style={[styles.doshaDetailDescription, { color: colors.icon }]}>
                  {secondaryDosha.description}
                </Text>
              </View>
            )}

            {/* Assessment Timeline */}
            <View style={[styles.timelineCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.timelineHeader}>
                <Ionicons name="time-outline" size={24} color={colors.herbalGreen} />
                <Text style={[styles.timelineTitle, { color: colors.text }]}>Assessment Timeline</Text>
              </View>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: colors.herbalGreen }]} />
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineDate, { color: colors.text }]}>
                    {new Date(prakriti.completedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={[styles.timelineEvent, { color: colors.icon }]}>
                    Prakriti Assessment Completed
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* No Assessment State */
          <View style={[styles.emptyStateCard, { backgroundColor: colors.cardBackground }]}>
            <LinearGradient
              colors={[colors.lightGreen, colors.herbalGreen]}
              style={styles.emptyStateIcon}
            >
              <Ionicons name="leaf-outline" size={48} color="white" />
            </LinearGradient>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              Discover Your Prakriti
            </Text>
            <Text style={[styles.emptyStateDescription, { color: colors.icon }]}>
              Take our comprehensive Ayurvedic assessment to understand your unique constitution and receive personalized recommendations.
            </Text>
          </View>
        )}

        {/* Action Buttons with Enhanced Design */}
        <View style={styles.actionContainer}>
          {prakriti ? (
            <>
              <TouchableOpacity
                style={[styles.primaryButton]}
                onPress={handleEditAssessment}
              >
                <LinearGradient
                  colors={[colors.herbalGreen, '#4A9D6A']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Edit Assessment</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.herbalGreen }]}
                onPress={handleRetakeAssessment}
              >
                <Ionicons name="refresh-outline" size={20} color={colors.herbalGreen} />
                <Text style={[styles.secondaryButtonText, { color: colors.herbalGreen }]}>
                  Retake Assessment
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tertiaryButton, { backgroundColor: colors.softOrange }]}
                onPress={handleBodyConstitution}
              >
                <Ionicons name="body-outline" size={20} color="white" />
                <Text style={styles.tertiaryButtonText}>
                  Show Body Constituency
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton]}
              onPress={handleEditAssessment}
            >
              <LinearGradient
                colors={[colors.herbalGreen, '#4A9D6A']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Take Assessment</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Dosha Information */}
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Understanding Doshas</Text>
          
          <View style={styles.doshaInfoList}>
            <View style={styles.doshaInfoItem}>
              <Text style={styles.doshaEmoji}>💨</Text>
              <View style={styles.doshaInfoContent}>
                <Text style={[styles.doshaInfoTitle, { color: colors.herbalGreen }]}>Vata</Text>
                <Text style={[styles.doshaInfoText, { color: colors.icon }]}>
                  Governs movement, breathing, circulation, and nervous system. 
                  Associated with creativity, flexibility, and quick thinking.
                </Text>
              </View>
            </View>

            <View style={styles.doshaInfoItem}>
              <Text style={styles.doshaEmoji}>🔥</Text>
              <View style={styles.doshaInfoContent}>
                <Text style={[styles.doshaInfoTitle, { color: colors.softOrange }]}>Pitta</Text>
                <Text style={[styles.doshaInfoText, { color: colors.icon }]}>
                  Controls metabolism, digestion, and body temperature. 
                  Associated with intelligence, courage, and leadership.
                </Text>
              </View>
            </View>

            <View style={styles.doshaInfoItem}>
              <Text style={styles.doshaEmoji}>🌍</Text>
              <View style={styles.doshaInfoContent}>
                <Text style={[styles.doshaInfoTitle, { color: colors.herbalGreen }]}>Kapha</Text>
                <Text style={[styles.doshaInfoText, { color: colors.icon }]}>
                  Provides structure, immunity, and stability. 
                  Associated with calmness, strength, and endurance.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Learn More Section */}
        <View style={[styles.learnMoreSection, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.learnMoreTitle, { color: colors.text }]}>
            Want to Learn More About Ayurveda?
          </Text>
          <Text style={[styles.learnMoreDescription, { color: colors.icon }]}>
            Discover the ancient wisdom behind your constitution assessment and how Ayurvedic principles guide your wellness journey.
          </Text>
          <TouchableOpacity
            style={[styles.learnMoreButton, { backgroundColor: colors.herbalGreen }]}
            onPress={() => router.push('/ayurveda-info' as any)}
          >
            <Ionicons name="book-outline" size={20} color="white" style={styles.learnMoreIcon} />
            <Text style={styles.learnMoreButtonText}>Learn More About Ayurveda</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  // Enhanced Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  constitutionDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 56,
    marginRight: 20,
  },
  constitutionInfo: {
    alignItems: 'flex-start',
  },
  primaryDoshaName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  secondaryDoshaName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  constitutionType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  // Enhanced Dosha Detail Cards
  doshaDetailCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  doshaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doshaHeaderEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  doshaHeaderInfo: {
    flex: 1,
  },
  doshaHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doshaHeaderSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  doshaDetailDescription: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 56,
  },
  // Timeline Card
  timelineCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineEvent: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Empty State Card
  emptyStateCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  // Enhanced Action Buttons
  actionContainer: {
    marginBottom: 32,
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tertiaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Dosha Info Section
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  doshaInfoList: {
    gap: 24,
  },
  doshaInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  doshaInfoContent: {
    flex: 1,
    marginLeft: 16,
  },
  doshaInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  doshaInfoText: {
    fontSize: 15,
    lineHeight: 22,
  },
  doshaEmoji: {
    fontSize: 40,
  },
  learnMoreSection: {
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
  learnMoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  learnMoreDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  learnMoreIcon: {
    marginRight: 8,
  },
  learnMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});