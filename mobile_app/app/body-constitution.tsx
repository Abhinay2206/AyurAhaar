import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import HumanBodySvg, { BodyPart } from '@/src/components/common/HumanBodySvg';
import { extendedBodyRegions, mapRegionsToBodyParts, getRegionFromBodyPart } from '@/src/components/common/BodyRegionMapping';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { prakritiApi } from '@/src/services/api';

const { width } = Dimensions.get('window');

interface AssessmentData {
  answers: any[];
  symptoms: string[];
  problemAreas: string[];
}

export default function BodyConstitutionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentPrakriti, setCurrentPrakriti] = useState<any>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch Prakriti data
      const response = await prakritiApi.getCurrentPrakriti();
      if (response.success && response.data?.currentPrakriti) {
        setCurrentPrakriti(response.data.currentPrakriti);
      }

      // Simulate assessment data - in real app, fetch from assessment API
      const mockAssessment: AssessmentData = {
        answers: [],
        symptoms: ['headache', 'anxiety', 'acidity', 'joint pain', 'skin rash'],
        problemAreas: ['head', 'stomach', 'joints', 'skin']
      };
      setAssessmentData(mockAssessment);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load constitution data');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for body part clicks - similar to the reactjs-human-body example
  const showBodyPart = (bodyPart: BodyPart) => {
    console.log("Body part clicked:", bodyPart);
    
    // Find the region that corresponds to this body part
    const region = getRegionFromBodyPart(bodyPart);
    if (region) {
      setSelectedRegion(selectedRegion === region.id ? null : region.id);
    }
  };

  const getDoshaColor = (dosha: string) => {
    switch (dosha.toLowerCase()) {
      case 'vata':
        return '#E3F2FD'; // Light blue
      case 'pitta':
        return '#FFF3E0'; // Light orange
      case 'kapha':
        return '#E8F5E8'; // Light green
      default:
        return '#F5F5F5';
    }
  };

  // Generate body parts input for the HumanBodySvg component
  const getBodyPartsInput = () => {
    if (!assessmentData) {
      // Return default configuration to show all body parts
      return {
        head: { color: '#E5E7EB' },
        eyes: { color: '#E5E7EB' },
        ears: { color: '#E5E7EB' },
        nose: { color: '#E5E7EB' },
        oral_cavity: { color: '#E5E7EB' },
        neck_or_throat: { color: '#E5E7EB' },
        chest: { color: '#E5E7EB' },
        upper_arm: { color: '#E5E7EB' },
        upper_abdomen: { color: '#E5E7EB' },
        forearm: { color: '#E5E7EB' },
        mid_abdomen: { color: '#E5E7EB' },
        lower_abdomen: { color: '#E5E7EB' },
        hand: { color: '#E5E7EB' },
        sexual_organs: { color: '#E5E7EB' },
        thigh: { color: '#E5E7EB' },
        knee: { color: '#E5E7EB' },
        lower_leg: { color: '#E5E7EB' },
        foot: { color: '#E5E7EB' },
      };
    }
    
    return mapRegionsToBodyParts(
      extendedBodyRegions,
      assessmentData.problemAreas,
      currentPrakriti,
      selectedRegion
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AyurvedaPattern />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Analyzing your body constitution...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AyurvedaPattern />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Body Constitution</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Constitution Overview */}
        <LinearGradient
          colors={[colors.herbalGreen, '#4A9D6A']}
          style={styles.overviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.overviewTitle}>🧘‍♀️ Your Constitution Map</Text>
          <Text style={styles.overviewSubtitle}>
            {currentPrakriti ? 
              `${currentPrakriti.primaryDosha}${currentPrakriti.secondaryDosha ? `-${currentPrakriti.secondaryDosha}` : ''} Constitution` : 
              'Analyzing your body constitution...'
            }
          </Text>
          <Text style={styles.overviewDescription}>
            Areas highlighted below show how your doshas affect different body systems
          </Text>
        </LinearGradient>

        {/* Body Visualization */}
        <View style={styles.bodyContainer}>
          <HumanBodySvg
            partsInput={getBodyPartsInput()}
            onPartPress={showBodyPart}
            width={width - 40}
            height={600}
          />
        </View>

        {/* Legend */}
        <View style={[styles.legendCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Constitution Legend</Text>
          
          <View style={styles.doshaLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getDoshaColor('vata') }]} />
              <View style={styles.legendContent}>
                <Text style={[styles.legendTitle, { color: colors.text }]}>🌬️ Vata Areas</Text>
                <Text style={[styles.legendDescription, { color: colors.icon }]}>
                  Movement, nervous system, joints
                </Text>
              </View>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getDoshaColor('pitta') }]} />
              <View style={styles.legendContent}>
                <Text style={[styles.legendTitle, { color: colors.text }]}>🔥 Pitta Areas</Text>
                <Text style={[styles.legendDescription, { color: colors.icon }]}>
                  Digestion, metabolism, skin
                </Text>
              </View>
            </View>
            
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getDoshaColor('kapha') }]} />
              <View style={styles.legendContent}>
                <Text style={[styles.legendTitle, { color: colors.text }]}>🌍 Kapha Areas</Text>
                <Text style={[styles.legendDescription, { color: colors.icon }]}>
                  Structure, immunity, respiratory
                </Text>
              </View>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF4444' }]} />
              <View style={styles.legendContent}>
                <Text style={[styles.legendTitle, { color: colors.text }]}>⚠️ Problem Areas</Text>
                <Text style={[styles.legendDescription, { color: colors.icon }]}>
                  Areas requiring attention based on assessment
                </Text>
              </View>
            </View>
          </View>

          {/* Problem Areas Summary */}
          {assessmentData && assessmentData.problemAreas.length > 0 && (
            <View style={[styles.problemSummary, { backgroundColor: colors.background }]}>
              <Text style={[styles.problemTitle, { color: '#FF4444' }]}>
                ⚠️ Areas Needing Attention
              </Text>
              <View style={styles.problemList}>
                {assessmentData.problemAreas.map((areaId) => {
                  const region = extendedBodyRegions.find(r => r.id === areaId);
                  return region ? (
                    <TouchableOpacity
                      key={areaId}
                      style={[styles.problemItem, { backgroundColor: '#FFF5F5' }]}
                      onPress={() => setSelectedRegion(areaId)}
                    >
                      <Text style={[styles.problemItemText, { color: '#D53F3F' }]}>
                        {region.name}
                      </Text>
                    </TouchableOpacity>
                  ) : null;
                })}
              </View>
            </View>
          )}
        </View>

        {/* Selected Region Details */}
        {selectedRegion && (
          <View style={[styles.detailCard, { backgroundColor: colors.cardBackground }]}>
            {(() => {
              const region = extendedBodyRegions.find(r => r.id === selectedRegion);
              if (!region) return null;
              
              const hasProblems = assessmentData?.problemAreas.includes(region.id) || false;
              
              return (
                <>
                  <Text style={[styles.detailTitle, { color: colors.text }]}>
                    {region.name}
                    {hasProblems && <Text style={{ color: '#FF4444' }}> ⚠️</Text>}
                  </Text>
                  <Text style={[styles.detailDescription, { color: colors.icon }]}>
                    {region.description}
                  </Text>
                  
                  {hasProblems && (
                    <View style={[styles.problemAlert, { backgroundColor: '#FFF5F5' }]}>
                      <Text style={[styles.problemAlertTitle, { color: '#D53F3F' }]}>
                        ⚠️ Attention Needed
                      </Text>
                      <Text style={[styles.problemAlertText, { color: '#B91C1C' }]}>
                        This area shows signs of imbalance based on your assessment
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.detailDoshas}>
                    <Text style={[styles.detailLabel, { color: colors.text }]}>
                      Governed by:
                    </Text>
                    <View style={styles.doshaChips}>
                      {region.doshas.map((dosha: string) => (
                        <View
                          key={dosha}
                          style={[
                            styles.doshaChip,
                            { backgroundColor: getDoshaColor(dosha) }
                          ]}
                        >
                          <Text style={styles.doshaChipText}>
                            {dosha.charAt(0).toUpperCase() + dosha.slice(1)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.symptomsSection}>
                    <Text style={[styles.detailLabel, { color: colors.text }]}>
                      Common symptoms:
                    </Text>
                    <View style={styles.symptomsList}>
                      {region.symptoms.map((symptom: string, index: number) => (
                        <Text key={index} style={[styles.symptomItem, { color: colors.icon }]}>
                          • {symptom}
                        </Text>
                      ))}
                    </View>
                  </View>
                </>
              );
            })()}
          </View>
        )}

        {/* Instructions */}
        <View style={[styles.instructionsCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Read Your Map</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, { color: colors.icon }]}>
                <Text style={{ fontWeight: 'bold' }}>Colored areas</Text> show your dosha influence on body systems
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, { color: colors.icon }]}>
                <Text style={{ fontWeight: 'bold', color: '#FF4444' }}>Red indicators (!)</Text> mark areas needing attention based on your assessment
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, { color: colors.icon }]}>
                <Text style={{ fontWeight: 'bold' }}>Tap any area</Text> to learn more about that body system and see specific symptoms
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, { color: colors.icon }]}>
                Focus on lifestyle and diet changes for areas marked with problems
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionBullet}>•</Text>
              <Text style={[styles.instructionText, { color: colors.icon }]}>
                Use this map to track improvements over time with reassessments
              </Text>
            </View>
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
    paddingTop: 44,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  overviewCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overviewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  overviewSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  overviewDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  bodyContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    minHeight: 600,
  },
  legendCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  doshaLegend: {
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  legendContent: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  legendDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  detailCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  detailDoshas: {
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  doshaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  doshaChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  doshaChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  instructionsCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A9D6A',
    marginRight: 8,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 30,
  },
  problemSummary: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE6E6',
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  problemList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  problemItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCCCB',
  },
  problemItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  problemAlert: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCCCB',
  },
  problemAlertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  problemAlertText: {
    fontSize: 13,
    lineHeight: 18,
  },
  symptomsSection: {
    marginTop: 16,
  },
  symptomsList: {
    marginTop: 8,
  },
  symptomItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});