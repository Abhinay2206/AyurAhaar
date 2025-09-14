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
import Svg, { Path, Circle, Ellipse, G, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { prakritiApi } from '@/src/services/api';

const { width } = Dimensions.get('window');

interface BodyRegion {
  id: string;
  name: string;
  doshas: string[];
  description: string;
  symptoms: string[];
  problemKeywords: string[];
  svgPath?: string;
}

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

  // Enhanced body regions with problem detection
  const bodyRegions: BodyRegion[] = [
    {
      id: 'head',
      name: 'Head & Brain',
      doshas: ['vata'],
      description: 'Nervous system, mental activity, and sensory functions',
      symptoms: ['Headaches', 'Mental fog', 'Anxiety', 'Insomnia', 'Memory issues'],
      problemKeywords: ['headache', 'anxiety', 'insomnia', 'stress', 'worry', 'mental', 'memory', 'concentration'],
    },
    {
      id: 'eyes',
      name: 'Eyes',
      doshas: ['pitta'],
      description: 'Vision, eye health, and optical clarity',
      symptoms: ['Dry eyes', 'Burning sensation', 'Poor vision', 'Eye strain'],
      problemKeywords: ['eye', 'vision', 'sight', 'dry eyes', 'burning eyes'],
    },
    {
      id: 'throat',
      name: 'Throat & Neck',
      doshas: ['kapha'],
      description: 'Communication, breathing, and lymphatic system',
      symptoms: ['Sore throat', 'Voice issues', 'Swollen glands', 'Neck tension'],
      problemKeywords: ['throat', 'voice', 'neck', 'swallow', 'glands'],
    },
    {
      id: 'chest',
      name: 'Chest & Heart',
      doshas: ['kapha', 'vata'],
      description: 'Respiratory system, circulation, and emotional center',
      symptoms: ['Chest congestion', 'Breathing issues', 'Heart palpitations', 'Cough'],
      problemKeywords: ['chest', 'heart', 'breathing', 'cough', 'lung', 'asthma', 'palpitation'],
    },
    {
      id: 'stomach',
      name: 'Stomach & Liver',
      doshas: ['pitta'],
      description: 'Digestion, metabolism, and transformation',
      symptoms: ['Acidity', 'Heartburn', 'Nausea', 'Digestive issues', 'Liver problems'],
      problemKeywords: ['stomach', 'digestion', 'acid', 'heartburn', 'nausea', 'liver', 'bile'],
    },
    {
      id: 'intestines',
      name: 'Intestines',
      doshas: ['vata', 'pitta'],
      description: 'Absorption, elimination, and gut health',
      symptoms: ['Constipation', 'Diarrhea', 'Bloating', 'Gas', 'IBS'],
      problemKeywords: ['constipation', 'diarrhea', 'bloating', 'gas', 'bowel', 'intestine', 'gut'],
    },
    {
      id: 'pelvis',
      name: 'Pelvis & Reproductive',
      doshas: ['vata', 'kapha'],
      description: 'Reproductive health and elimination',
      symptoms: ['Menstrual issues', 'Reproductive problems', 'Urinary issues'],
      problemKeywords: ['menstrual', 'period', 'reproductive', 'urinary', 'bladder', 'sexual'],
    },
    {
      id: 'joints',
      name: 'Joints & Bones',
      doshas: ['vata'],
      description: 'Movement, flexibility, and skeletal system',
      symptoms: ['Joint pain', 'Stiffness', 'Arthritis', 'Bone issues'],
      problemKeywords: ['joint', 'bone', 'arthritis', 'stiff', 'pain', 'ache', 'muscle'],
    },
    {
      id: 'skin',
      name: 'Skin',
      doshas: ['pitta'],
      description: 'Protection, temperature regulation, and appearance',
      symptoms: ['Rashes', 'Acne', 'Dryness', 'Inflammation', 'Allergies'],
      problemKeywords: ['skin', 'rash', 'acne', 'eczema', 'dry skin', 'allergy', 'itching'],
    },
  ];

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

  // Check if a region has problems based on assessment
  const hasProblems = (regionId: string): boolean => {
    if (!assessmentData) return false;
    
    const region = bodyRegions.find(r => r.id === regionId);
    if (!region) return false;

    // Check if any symptoms match this region's problem keywords
    return assessmentData.symptoms.some(symptom => 
      region.problemKeywords.some(keyword => 
        symptom.toLowerCase().includes(keyword.toLowerCase())
      )
    ) || assessmentData.problemAreas.includes(regionId);
  };

  // Get region color based on problems and dosha dominance
  const getRegionColor = (region: BodyRegion): string => {
    if (hasProblems(region.id)) {
      return '#FF4444'; // Red for problem areas
    }

    if (!currentPrakriti) return '#E0E0E0';

    const { primaryDosha, secondaryDosha } = currentPrakriti;
    const userDoshas = [primaryDosha?.toLowerCase(), secondaryDosha?.toLowerCase()].filter(Boolean);
    
    // Check if this region is affected by user's dominant doshas
    const regionDoshas = region.doshas.map(d => d.toLowerCase());
    const hasMatch = regionDoshas.some(dosha => userDoshas.includes(dosha));
    
    if (hasMatch) {
      if (regionDoshas.includes('vata') && userDoshas.includes('vata')) {
        return '#8E4EC6'; // Purple for Vata
      } else if (regionDoshas.includes('pitta') && userDoshas.includes('pitta')) {
        return '#FF6B35'; // Orange for Pitta
      } else if (regionDoshas.includes('kapha') && userDoshas.includes('kapha')) {
        return '#4A90E2'; // Blue for Kapha
      }
    }
    
    return '#E0E0E0'; // Default gray
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

  const getRegionOpacity = (region: BodyRegion): number => {
    if (hasProblems(region.id)) {
      return 0.8; // High opacity for problems
    }
    if (selectedRegion === region.id) {
      return 0.8;
    }
    if (!currentPrakriti) return 0.3;
    
    const { primaryDosha, secondaryDosha } = currentPrakriti;
    const userDoshas = [primaryDosha?.toLowerCase(), secondaryDosha?.toLowerCase()].filter(Boolean);
    const regionDoshas = region.doshas.map(d => d.toLowerCase());
    const hasMatch = regionDoshas.some(dosha => userDoshas.includes(dosha));
    
    return hasMatch ? 0.7 : 0.3;
  };

  const renderHumanBody = () => {
    return (
      <View style={styles.bodyContainer}>
        <Svg width={width - 40} height={600} viewBox="0 0 400 600">
          <Defs>
            {/* Simple gradient for body parts */}
            <SvgLinearGradient id="bodyFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#F8F9FA" />
              <Stop offset="100%" stopColor="#E9ECEF" />
            </SvgLinearGradient>
          </Defs>

          {/* Anatomical Human Body Outline */}
          <G>
            {/* Main body outline - matching your reference image */}
            <Path
              d="M200 25
                 C215 25, 235 30, 235 55
                 C235 75, 230 85, 225 95
                 C220 100, 215 105, 210 110
                 C230 115, 250 125, 265 140
                 C280 155, 290 175, 295 195
                 C300 215, 295 235, 290 255
                 C285 275, 280 295, 275 315
                 C270 335, 265 355, 260 375
                 C255 390, 250 400, 245 410
                 C240 420, 235 430, 230 445
                 C225 460, 220 480, 215 500
                 C210 520, 205 540, 200 560
                 C195 580, 190 590, 185 595
                 L175 595
                 C170 590, 165 580, 160 560
                 C155 540, 150 520, 145 500
                 C140 480, 135 460, 130 445
                 C125 430, 120 420, 115 410
                 C110 400, 105 390, 100 375
                 C95 355, 90 335, 85 315
                 C80 295, 75 275, 70 255
                 C65 235, 60 215, 65 195
                 C70 175, 80 155, 95 140
                 C110 125, 130 115, 150 110
                 C145 105, 140 100, 135 95
                 C130 85, 125 75, 125 55
                 C125 30, 145 25, 160 25
                 L200 25 Z"
              fill="url(#bodyFill)"
              stroke="#666"
              strokeWidth="2"
            />

            {/* Head region */}
            <Circle
              cx="180"
              cy="55"
              r="30"
              fill={getRegionColor(bodyRegions.find(r => r.id === 'head')!)}
              fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'head')!)}
              stroke={selectedRegion === 'head' ? colors.herbalGreen : hasProblems('head') ? '#FF0000' : 'transparent'}
              strokeWidth={selectedRegion === 'head' || hasProblems('head') ? 3 : 0}
              onPress={() => setSelectedRegion(selectedRegion === 'head' ? null : 'head')}
            />

            {/* Eyes */}
            <Circle cx="170" cy="50" r="3" 
                    fill={getRegionColor(bodyRegions.find(r => r.id === 'eyes')!)} 
                    fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'eyes')!)}
                    stroke={hasProblems('eyes') ? '#FF0000' : selectedRegion === 'eyes' ? colors.herbalGreen : 'transparent'} 
                    strokeWidth={hasProblems('eyes') || selectedRegion === 'eyes' ? 2 : 0}
                    onPress={() => setSelectedRegion(selectedRegion === 'eyes' ? null : 'eyes')} />
            <Circle cx="190" cy="50" r="3" 
                    fill={getRegionColor(bodyRegions.find(r => r.id === 'eyes')!)} 
                    fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'eyes')!)}
                    stroke={hasProblems('eyes') ? '#FF0000' : selectedRegion === 'eyes' ? colors.herbalGreen : 'transparent'} 
                    strokeWidth={hasProblems('eyes') || selectedRegion === 'eyes' ? 2 : 0}
                    onPress={() => setSelectedRegion(selectedRegion === 'eyes' ? null : 'eyes')} />

            {/* Neck/Throat */}
            <Ellipse
              cx="180"
              cy="95"
              rx="15"
              ry="20"
              fill={getRegionColor(bodyRegions.find(r => r.id === 'throat')!)}
              fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'throat')!)}
              stroke={selectedRegion === 'throat' ? colors.herbalGreen : hasProblems('throat') ? '#FF0000' : 'transparent'}
              strokeWidth={selectedRegion === 'throat' || hasProblems('throat') ? 3 : 0}
              onPress={() => setSelectedRegion(selectedRegion === 'throat' ? null : 'throat')}
            />

            {/* Chest area */}
            <Ellipse
              cx="180"
              cy="160"
              rx="45"
              ry="40"
              fill={getRegionColor(bodyRegions.find(r => r.id === 'chest')!)}
              fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'chest')!)}
              stroke={selectedRegion === 'chest' ? colors.herbalGreen : hasProblems('chest') ? '#FF0000' : 'transparent'}
              strokeWidth={selectedRegion === 'chest' || hasProblems('chest') ? 3 : 0}
              onPress={() => setSelectedRegion(selectedRegion === 'chest' ? null : 'chest')}
            />

            {/* Stomach */}
            <Ellipse
              cx="180"
              cy="230"
              rx="35"
              ry="30"
              fill={getRegionColor(bodyRegions.find(r => r.id === 'stomach')!)}
              fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'stomach')!)}
              stroke={selectedRegion === 'stomach' ? colors.herbalGreen : hasProblems('stomach') ? '#FF0000' : 'transparent'}
              strokeWidth={selectedRegion === 'stomach' || hasProblems('stomach') ? 3 : 0}
              onPress={() => setSelectedRegion(selectedRegion === 'stomach' ? null : 'stomach')}
            />

            {/* Intestines */}
            <Ellipse
              cx="180"
              cy="295"
              rx="40"
              ry="25"
              fill={getRegionColor(bodyRegions.find(r => r.id === 'intestines')!)}
              fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'intestines')!)}
              stroke={selectedRegion === 'intestines' ? colors.herbalGreen : hasProblems('intestines') ? '#FF0000' : 'transparent'}
              strokeWidth={selectedRegion === 'intestines' || hasProblems('intestines') ? 3 : 0}
              onPress={() => setSelectedRegion(selectedRegion === 'intestines' ? null : 'intestines')}
            />

            {/* Pelvis */}
            <Ellipse
              cx="180"
              cy="355"
              rx="35"
              ry="20"
              fill={getRegionColor(bodyRegions.find(r => r.id === 'pelvis')!)}
              fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'pelvis')!)}
              stroke={selectedRegion === 'pelvis' ? colors.herbalGreen : hasProblems('pelvis') ? '#FF0000' : 'transparent'}
              strokeWidth={selectedRegion === 'pelvis' || hasProblems('pelvis') ? 3 : 0}
              onPress={() => setSelectedRegion(selectedRegion === 'pelvis' ? null : 'pelvis')}
            />

            {/* Left arm */}
            <Ellipse cx="120" cy="160" rx="10" ry="35" 
                     fill={getRegionColor(bodyRegions.find(r => r.id === 'joints')!)}
                     fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'joints')!)}
                     stroke={selectedRegion === 'joints' ? colors.herbalGreen : hasProblems('joints') ? '#FF0000' : 'transparent'}
                     strokeWidth={selectedRegion === 'joints' || hasProblems('joints') ? 3 : 0}
                     onPress={() => setSelectedRegion(selectedRegion === 'joints' ? null : 'joints')} />
            
            {/* Left forearm */}
            <Ellipse cx="105" cy="210" rx="8" ry="30" 
                     fill={getRegionColor(bodyRegions.find(r => r.id === 'joints')!)}
                     fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'joints')!)}
                     stroke={selectedRegion === 'joints' ? colors.herbalGreen : hasProblems('joints') ? '#FF0000' : 'transparent'}
                     strokeWidth={selectedRegion === 'joints' || hasProblems('joints') ? 3 : 0}
                     onPress={() => setSelectedRegion(selectedRegion === 'joints' ? null : 'joints')} />

            {/* Right arm */}
            <Ellipse cx="240" cy="160" rx="10" ry="35" 
                     fill={getRegionColor(bodyRegions.find(r => r.id === 'joints')!)}
                     fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'joints')!)}
                     stroke={selectedRegion === 'joints' ? colors.herbalGreen : hasProblems('joints') ? '#FF0000' : 'transparent'}
                     strokeWidth={selectedRegion === 'joints' || hasProblems('joints') ? 3 : 0}
                     onPress={() => setSelectedRegion(selectedRegion === 'joints' ? null : 'joints')} />
            
            {/* Right forearm */}
            <Ellipse cx="255" cy="210" rx="8" ry="30" 
                     fill={getRegionColor(bodyRegions.find(r => r.id === 'joints')!)}
                     fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'joints')!)}
                     stroke={selectedRegion === 'joints' ? colors.herbalGreen : hasProblems('joints') ? '#FF0000' : 'transparent'}
                     strokeWidth={selectedRegion === 'joints' || hasProblems('joints') ? 3 : 0}
                     onPress={() => setSelectedRegion(selectedRegion === 'joints' ? null : 'joints')} />

            {/* Left leg */}
            <Ellipse cx="160" cy="450" rx="12" ry="50" 
                     fill={getRegionColor(bodyRegions.find(r => r.id === 'joints')!)}
                     fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'joints')!)}
                     stroke={selectedRegion === 'joints' ? colors.herbalGreen : hasProblems('joints') ? '#FF0000' : 'transparent'}
                     strokeWidth={selectedRegion === 'joints' || hasProblems('joints') ? 3 : 0}
                     onPress={() => setSelectedRegion(selectedRegion === 'joints' ? null : 'joints')} />

            {/* Right leg */}
            <Ellipse cx="200" cy="450" rx="12" ry="50" 
                     fill={getRegionColor(bodyRegions.find(r => r.id === 'joints')!)}
                     fillOpacity={getRegionOpacity(bodyRegions.find(r => r.id === 'joints')!)}
                     stroke={selectedRegion === 'joints' ? colors.herbalGreen : hasProblems('joints') ? '#FF0000' : 'transparent'}
                     strokeWidth={selectedRegion === 'joints' || hasProblems('joints') ? 3 : 0}
                     onPress={() => setSelectedRegion(selectedRegion === 'joints' ? null : 'joints')} />

            {/* Skin indication - body outline with dashed line if skin problems */}
            <Path
              d="M200 25
                 C215 25, 235 30, 235 55
                 C235 75, 230 85, 225 95
                 C220 100, 215 105, 210 110
                 C230 115, 250 125, 265 140
                 C280 155, 290 175, 295 195
                 C300 215, 295 235, 290 255
                 C285 275, 280 295, 275 315
                 C270 335, 265 355, 260 375
                 C255 390, 250 400, 245 410
                 C240 420, 235 430, 230 445
                 C225 460, 220 480, 215 500
                 C210 520, 205 540, 200 560
                 C195 580, 190 590, 185 595
                 L175 595
                 C170 590, 165 580, 160 560
                 C155 540, 150 520, 145 500
                 C140 480, 135 460, 130 445
                 C125 430, 120 420, 115 410
                 C110 400, 105 390, 100 375
                 C95 355, 90 335, 85 315
                 C80 295, 75 275, 70 255
                 C65 235, 60 215, 65 195
                 C70 175, 80 155, 95 140
                 C110 125, 130 115, 150 110
                 C145 105, 140 100, 135 95
                 C130 85, 125 75, 125 55
                 C125 30, 145 25, 160 25
                 L200 25 Z"
              fill="transparent"
              stroke={getRegionColor(bodyRegions.find(r => r.id === 'skin')!)}
              strokeWidth={hasProblems('skin') ? 4 : selectedRegion === 'skin' ? 3 : 0}
              strokeOpacity={selectedRegion === 'skin' || hasProblems('skin') ? 0.8 : 0}
              strokeDasharray={hasProblems('skin') ? "8,4" : "0"}
              onPress={() => setSelectedRegion(selectedRegion === 'skin' ? null : 'skin')}
            />

            {/* Problem indicators */}
            {bodyRegions.map((region) => {
              if (!hasProblems(region.id)) return null;
              
              let centerX = 180, centerY = 200;
              switch (region.id) {
                case 'head': centerX = 220; centerY = 40; break;
                case 'eyes': centerX = 220; centerY = 50; break;
                case 'throat': centerX = 210; centerY = 95; break;
                case 'chest': centerX = 235; centerY = 140; break;
                case 'stomach': centerX = 225; centerY = 210; break;
                case 'intestines': centerX = 230; centerY = 280; break;
                case 'pelvis': centerX = 220; centerY = 340; break;
                case 'joints': centerX = 270; centerY = 180; break;
                case 'skin': centerX = 280; centerY = 250; break;
              }
              
              return (
                <G key={`problem-${region.id}`}>
                  <Circle
                    cx={centerX}
                    cy={centerY}
                    r="12"
                    fill="#FF4444"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    onPress={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                  />
                  <SvgText
                    x={centerX}
                    y={centerY + 3}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#FFFFFF"
                    fontWeight="bold"
                  >
                    !
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </View>
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
        {renderHumanBody()}

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
                  const region = bodyRegions.find(r => r.id === areaId);
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
              const region = bodyRegions.find(r => r.id === selectedRegion);
              if (!region) return null;
              
              return (
                <>
                  <Text style={[styles.detailTitle, { color: colors.text }]}>
                    {region.name}
                    {hasProblems(region.id) && <Text style={{ color: '#FF4444' }}> ⚠️</Text>}
                  </Text>
                  <Text style={[styles.detailDescription, { color: colors.icon }]}>
                    {region.description}
                  </Text>
                  
                  {hasProblems(region.id) && (
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
                      {region.doshas.map((dosha) => (
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
                      {region.symptoms.map((symptom, index) => (
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