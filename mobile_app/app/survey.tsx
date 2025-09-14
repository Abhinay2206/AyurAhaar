import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Slider from '@react-native-community/slider';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { AuthService } from '@/src/services/auth';
import { surveyApi, prakritiApi, PrakritiQuestion } from '@/src/services/api';

interface SurveyData {
  fullName: string;
  mobileNumber: string;
  age: number;
  weight: string;
  height: string;
  heightUnit: 'cm' | 'ft';
  heightFeet: string;
  heightInches: string;
  lifestyle: string;
  allergies: string[];
  healthConditions: string[];
  customAllergies: string;
  preferredCuisine: string[];
}

enum SurveyStep {
  BASIC_INFO = 0,
  PRAKRITI_ASSESSMENT = 1,
  COMPLETE = 2,
}

const lifestyleOptions = [
  { label: 'Sedentary (Little to no exercise)', value: 'sedentary', icon: 'bed-outline' },
  { label: 'Lightly Active (Light exercise 1-3 days/week)', value: 'light', icon: 'walk-outline' },
  { label: 'Moderately Active (Exercise 3-5 days/week)', value: 'moderate', icon: 'bicycle-outline' },
  { label: 'Very Active (Hard exercise 6-7 days/week)', value: 'active', icon: 'fitness-outline' },
  { label: 'Extremely Active (Physical job + exercise)', value: 'very_active', icon: 'barbell-outline' },
];

const allergyOptions = [
  { label: 'None', value: 'none', icon: 'checkmark-circle-outline' },
  { label: 'Dairy', value: 'dairy', icon: 'water-outline' },
  { label: 'Nuts', value: 'nuts', icon: 'nutrition-outline' },
  { label: 'Gluten', value: 'gluten', icon: 'restaurant-outline' },
  { label: 'Soy', value: 'soy', icon: 'leaf-outline' },
  { label: 'Eggs', value: 'eggs', icon: 'egg-outline' },
  { label: 'Shellfish', value: 'shellfish', icon: 'fish-outline' },
  { label: 'Fish', value: 'fish', icon: 'fish-outline' },
  { label: 'Sesame', value: 'sesame', icon: 'flower-outline' },
  { label: 'Other', value: 'other', icon: 'add-circle-outline' }
];

const healthConditionOptions = [
  { label: 'Diabetes', value: 'diabetes', icon: 'medical-outline' },
  { label: 'High Blood Pressure', value: 'hypertension', icon: 'heart-outline' },
  { label: 'PCOS/PCOD', value: 'pcos', icon: 'female-outline' },
  { label: 'Obesity', value: 'obesity', icon: 'fitness-outline' },
  { label: 'Heart Disease', value: 'heart_disease', icon: 'heart-dislike-outline' },
  { label: 'Thyroid Disorders', value: 'thyroid', icon: 'pulse-outline' },
  { label: 'Digestive Issues', value: 'digestive', icon: 'restaurant-outline' },
  { label: 'None', value: 'none', icon: 'checkmark-circle-outline' }
];

const cuisineOptions = [
  { label: 'North Indian', value: 'north_indian', icon: 'restaurant-outline' },
  { label: 'South Indian', value: 'south_indian', icon: 'leaf-outline' },
  { label: 'Gujarati', value: 'gujarati', icon: 'flower-outline' },
  { label: 'Punjabi', value: 'punjabi', icon: 'restaurant-outline' },
  { label: 'Bengali', value: 'bengali', icon: 'fish-outline' },
  { label: 'Maharashtrian', value: 'maharashtrian', icon: 'nutrition-outline' },
  { label: 'Tamil', value: 'tamil', icon: 'leaf-outline' },
  { label: 'Kerala', value: 'kerala', icon: 'fish-outline' },
  { label: 'Rajasthani', value: 'rajasthani', icon: 'restaurant-outline' },
  { label: 'Continental', value: 'continental', icon: 'wine-outline' },
  { label: 'Chinese', value: 'chinese', icon: 'restaurant-outline' },
  { label: 'Mediterranean', value: 'mediterranean', icon: 'leaf-outline' },
  { label: 'Italian', value: 'italian', icon: 'pizza-outline' },
  { label: 'Mexican', value: 'mexican', icon: 'restaurant-outline' },
  { label: 'Thai', value: 'thai', icon: 'leaf-outline' },
  { label: 'Japanese', value: 'japanese', icon: 'fish-outline' }
];

export default function SurveyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Survey step management
  const [currentStep, setCurrentStep] = useState<SurveyStep>(SurveyStep.BASIC_INFO);
  const [loading, setLoading] = useState(false);

  // Basic survey data
  const [surveyData, setSurveyData] = useState<SurveyData>({
    fullName: '',
    mobileNumber: '',
    age: 25,
    weight: '',
    height: '',
    heightUnit: 'cm',
    heightFeet: '',
    heightInches: '',
    lifestyle: '',
    allergies: [],
    healthConditions: [],
    customAllergies: '',
    preferredCuisine: [],
  });

  // Prakriti assessment data
  const [prakritiQuestions, setPrakritiQuestions] = useState<PrakritiQuestion[]>([]);
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [prakritiScores, setPrakritiScores] = useState({ vata: 0, pitta: 0, kapha: 0 });
  const [prakritiResult, setPrakritiResult] = useState<any>(null);

  // UI state
  const [showHealthConditions, setShowHealthConditions] = useState(false);
  const [showCustomAllergyInput, setShowCustomAllergyInput] = useState(false);
  const [showLifestyleDropdown, setShowLifestyleDropdown] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Load Prakriti questions
    loadPrakritiQuestions();
  }, [fadeAnim]);

  const loadPrakritiQuestions = async () => {
    try {
      const response = await prakritiApi.getQuestions();
      if (response.success && response.data) {
        setPrakritiQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error loading Prakriti questions:', error);
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: string,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'phone-pad' = 'default',
    required: boolean = true
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        {label} {required && <Text style={{ color: colors.softOrange }}>*</Text>}
      </Text>
      <View style={[
        styles.inputWrapper, 
        { 
          borderColor: value ? colors.herbalGreen : colors.inputBorder,
          backgroundColor: colors.cardBackground 
        }
      ]}>
        <Ionicons name={icon as any} size={20} color={colors.herbalGreen} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          keyboardType={keyboardType}
        />
        {value ? (
          <Ionicons name="checkmark-circle" size={20} color={colors.herbalGreen} />
        ) : null}
      </View>
    </View>
  );

  const updateField = (field: keyof SurveyData, value: string | string[] | number) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'none') {
      updateField('allergies', ['none']);
      updateField('customAllergies', '');
      setShowCustomAllergyInput(false);
      return;
    }
    
    if (allergy === 'other') {
      setShowCustomAllergyInput(true);
      if (!surveyData.allergies.includes('other')) {
        const newAllergies = surveyData.allergies.filter(a => a !== 'none');
        updateField('allergies', [...newAllergies, 'other']);
      }
      return;
    }
    
    let newAllergies = surveyData.allergies.filter(a => a !== 'none');
    
    if (newAllergies.includes(allergy)) {
      newAllergies = newAllergies.filter(a => a !== allergy);
    } else {
      newAllergies = [...newAllergies, allergy];
    }
    
    updateField('allergies', newAllergies);
  };

  const toggleHealthCondition = (condition: string) => {
    if (condition === 'none') {
      updateField('healthConditions', ['none']);
      return;
    }
    
    let newConditions = surveyData.healthConditions.filter(c => c !== 'none');
    
    if (newConditions.includes(condition)) {
      newConditions = newConditions.filter(c => c !== condition);
    } else {
      newConditions = [...newConditions, condition];
    }
    
    updateField('healthConditions', newConditions);
  };

  const toggleCuisine = (cuisine: string) => {
    let newCuisines = [...surveyData.preferredCuisine];
    
    if (newCuisines.includes(cuisine)) {
      newCuisines = newCuisines.filter(c => c !== cuisine);
    } else {
      newCuisines = [...newCuisines, cuisine];
    }
    
    updateField('preferredCuisine', newCuisines);
  };

  const validateForm = () => {
    const { fullName, mobileNumber, age, weight, heightUnit, height, heightFeet, heightInches, lifestyle } = surveyData;
    
    if (!fullName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return false;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (age < 1 || age > 120) {
      Alert.alert('Invalid Age', 'Please select a valid age between 1 and 120');
      return false;
    }
    if (!weight.trim() || parseFloat(weight) < 1) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight in kg');
      return false;
    }
    
    // Validate height based on unit
    if (heightUnit === 'cm') {
      if (!height.trim() || parseFloat(height) < 1) {
        Alert.alert('Invalid Height', 'Please enter a valid height in cm');
        return false;
      }
    } else {
      if (!heightFeet.trim() || !heightInches.trim() || parseFloat(heightFeet) < 1 || parseFloat(heightInches) < 0 || parseFloat(heightInches) >= 12) {
        Alert.alert('Invalid Height', 'Please enter valid height in feet and inches');
        return false;
      }
    }
    
    if (!lifestyle) {
      Alert.alert('Missing Information', 'Please select your lifestyle');
      return false;
    }
    
    return true;
  };

  const handleNext = async () => {
    if (currentStep === SurveyStep.BASIC_INFO) {
      // Validate and submit basic info first
      if (validateForm()) {
        setLoading(true);
        try {
          // Convert height to cm if needed
          let heightInCm = 0;
          if (surveyData.heightUnit === 'cm') {
            heightInCm = parseInt(surveyData.height) || 0;
          } else {
            const feet = parseInt(surveyData.heightFeet) || 0;
            const inches = parseInt(surveyData.heightInches) || 0;
            heightInCm = Math.round((feet * 12 + inches) * 2.54);
          }

          const submissionData = {
            age: surveyData.age,
            weight: parseInt(surveyData.weight) || 0,
            height: heightInCm,
            lifestyle: surveyData.lifestyle,
            allergies: surveyData.allergies.filter(allergy => allergy !== 'none'),
            healthConditions: surveyData.healthConditions.filter(condition => condition !== 'none'),
            preferredCuisine: surveyData.preferredCuisine,
          };

          const response = await surveyApi.submitSurvey(submissionData);

          if (response.success) {
            // Start Prakriti assessment
            const assessmentResponse = await prakritiApi.startAssessment();
            
            if (assessmentResponse.success && assessmentResponse.data) {
              setAssessmentId(assessmentResponse.data.assessmentId);
              setCurrentStep(SurveyStep.PRAKRITI_ASSESSMENT);
            } else {
              Alert.alert('Error', 'Failed to start Prakriti assessment');
            }
          } else {
            Alert.alert('Error', response.error || 'Failed to submit survey. Please try again.');
          }
        } catch (error) {
          console.error('Survey submission error:', error);
          Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    } else if (currentStep === SurveyStep.COMPLETE) {
      // Navigate to plan selection after completing assessment
      setLoading(true);
      try {
        // Update survey completion status
        await AuthService.handleSurveyCompletion();
        
        // Force navigate to plan selection
        console.log('🎯 Navigating to plan-selection...');
        router.push('/plan-selection');
        
        // Also show success message
        setTimeout(() => {
          Alert.alert(
            'Assessment Complete!', 
            'Your comprehensive health and Prakriti assessment has been completed successfully.',
            [{ text: 'OK' }]
          );
        }, 500);
      } catch (error) {
        console.error('Error completing survey:', error);
        Alert.alert('Error', 'Failed to complete survey. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrakritiAnswer = async (optionIndex: number) => {
    if (!assessmentId || currentQuestionIndex >= prakritiQuestions.length) return;
    
    setLoading(true);
    try {
      const currentQuestion = prakritiQuestions[currentQuestionIndex];
      const response = await prakritiApi.submitAnswer(
        assessmentId,
        currentQuestion.questionNumber,
        optionIndex
      );

      if (response.success && response.data) {
        setPrakritiScores(response.data.currentScores);

        // Check if assessment is complete
        if (response.data.isAssessmentComplete && response.data.prakritiResult) {
          setPrakritiResult(response.data.prakritiResult);
          setCurrentStep(SurveyStep.COMPLETE);
        } else {
          // Move to next question
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting Prakriti answer:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title: string, icon: string, subtitle?: string) => (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconContainer, { backgroundColor: colors.lightGreen }]}>
        <Ionicons name={icon as any} size={24} color={colors.herbalGreen} />
      </View>
      <View style={styles.sectionTextContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  const renderAgeSlider = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        Age <Text style={{ color: colors.softOrange }}>*</Text>
      </Text>
      <View style={[styles.sliderContainer, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.sliderHeaderRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.herbalGreen} />
          <Text style={[styles.sliderValueText, { color: colors.herbalGreen }]}>
            {surveyData.age} years old
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={120}
          value={surveyData.age}
          onValueChange={(value) => updateField('age', Math.round(value))}
          minimumTrackTintColor={colors.herbalGreen}
          maximumTrackTintColor={colors.inputBorder}
          thumbTintColor={colors.herbalGreen}
        />
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: colors.icon }]}>1</Text>
          <Text style={[styles.sliderLabel, { color: colors.icon }]}>120</Text>
        </View>
      </View>
    </View>
  );

  const renderHeightSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        Height <Text style={{ color: colors.softOrange }}>*</Text>
      </Text>
      
      {/* Height Unit Toggle */}
      <View style={styles.heightUnitToggle}>
        <TouchableOpacity
          style={[
            styles.unitButton,
            {
              backgroundColor: surveyData.heightUnit === 'cm' ? colors.herbalGreen : colors.lightGreen,
              borderColor: colors.herbalGreen,
            }
          ]}
          onPress={() => updateField('heightUnit', 'cm')}
        >
          <Text style={[
            styles.unitButtonText,
            { color: surveyData.heightUnit === 'cm' ? 'white' : colors.herbalGreen }
          ]}>
            Centimeters
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.unitButton,
            {
              backgroundColor: surveyData.heightUnit === 'ft' ? colors.herbalGreen : colors.lightGreen,
              borderColor: colors.herbalGreen,
            }
          ]}
          onPress={() => updateField('heightUnit', 'ft')}
        >
          <Text style={[
            styles.unitButtonText,
            { color: surveyData.heightUnit === 'ft' ? 'white' : colors.herbalGreen }
          ]}>
            Feet & Inches
          </Text>
        </TouchableOpacity>
      </View>

      {/* Height Input Fields */}
      {surveyData.heightUnit === 'cm' ? (
        <View style={[styles.inputWrapper, { 
          borderColor: surveyData.height ? colors.herbalGreen : colors.inputBorder,
          backgroundColor: colors.cardBackground 
        }]}>
          <Ionicons name="resize-outline" size={20} color={colors.herbalGreen} style={styles.inputIcon} />
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            value={surveyData.height}
            onChangeText={(text) => updateField('height', text)}
            placeholder="Enter height in cm (e.g., 170)"
            placeholderTextColor={colors.icon}
            keyboardType="numeric"
          />
          {surveyData.height ? (
            <Text style={[styles.unitSuffix, { color: colors.herbalGreen }]}>cm</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.rowContainer}>
          <View style={styles.halfInput}>
            <View style={[styles.inputWrapper, { 
              borderColor: surveyData.heightFeet ? colors.herbalGreen : colors.inputBorder,
              backgroundColor: colors.cardBackground 
            }]}>
              <Ionicons name="resize-outline" size={20} color={colors.herbalGreen} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={surveyData.heightFeet}
                onChangeText={(text) => updateField('heightFeet', text)}
                placeholder="Feet"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
              />
              {surveyData.heightFeet ? (
                <Text style={[styles.unitSuffix, { color: colors.herbalGreen }]}>ft</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.halfInput}>
            <View style={[styles.inputWrapper, { 
              borderColor: surveyData.heightInches ? colors.herbalGreen : colors.inputBorder,
              backgroundColor: colors.cardBackground 
            }]}>
              <Ionicons name="resize-outline" size={20} color={colors.herbalGreen} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={surveyData.heightInches}
                onChangeText={(text) => updateField('heightInches', text)}
                placeholder="Inches"
                placeholderTextColor={colors.icon}
                keyboardType="numeric"
              />
              {surveyData.heightInches ? (
                <Text style={[styles.unitSuffix, { color: colors.herbalGreen }]}>in</Text>
              ) : null}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderAllergyChips = () => (
    <View>
      <View style={styles.chipsContainer}>
        {allergyOptions.map((allergy) => (
          <TouchableOpacity
            key={allergy.value}
            style={[
              styles.modernChip,
              {
                backgroundColor: surveyData.allergies.includes(allergy.value)
                  ? colors.herbalGreen
                  : colors.lightGreen,
                borderColor: colors.herbalGreen,
              }
            ]}
            onPress={() => toggleAllergy(allergy.value)}
          >
            <Ionicons 
              name={allergy.icon as any} 
              size={16} 
              color={surveyData.allergies.includes(allergy.value) ? 'white' : colors.herbalGreen} 
            />
            <Text
              style={[
                styles.chipText,
                {
                  color: surveyData.allergies.includes(allergy.value)
                    ? 'white'
                    : colors.herbalGreen,
                }
              ]}
            >
              {allergy.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Custom allergy input */}
      {showCustomAllergyInput && surveyData.allergies.includes('other') && (
        <View style={styles.customInputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text, fontSize: 14 }]}>
            Please specify other allergies:
          </Text>
          <View style={[styles.inputWrapper, { borderColor: colors.inputBorder, backgroundColor: colors.cardBackground }]}>
            <Ionicons name="medical-outline" size={20} color={colors.herbalGreen} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={surveyData.customAllergies}
              onChangeText={(text) => updateField('customAllergies', text)}
              placeholder="Enter other allergies (comma separated)"
              placeholderTextColor={colors.icon}
              multiline
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderHealthConditions = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        Health Conditions <Text style={[styles.inputSubtext, { color: colors.icon, fontSize: 12, fontWeight: 'normal' }]}>(optional)</Text>
      </Text>
      <TouchableOpacity
        style={[styles.modernDropdownButton, { borderColor: colors.inputBorder, backgroundColor: colors.cardBackground }]}
        onPress={() => setShowHealthConditions(!showHealthConditions)}
      >
        <Ionicons name="medical" size={20} color={colors.herbalGreen} />
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {surveyData.healthConditions.length > 0
            ? `${surveyData.healthConditions.length} condition${surveyData.healthConditions.length > 1 ? 's' : ''} selected`
            : 'Select health conditions'}
        </Text>
        <Ionicons
          name={showHealthConditions ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.icon}
        />
      </TouchableOpacity>
      {showHealthConditions && (
        <View style={[styles.modernCheckboxContainer, { backgroundColor: colors.cardBackground }]}>
          {healthConditionOptions.map((condition) => (
            <TouchableOpacity
              key={condition.value}
              style={styles.modernCheckboxItem}
              onPress={() => toggleHealthCondition(condition.value)}
            >
              <Ionicons name={condition.icon as any} size={20} color={colors.herbalGreen} />
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                {condition.label}
              </Text>
              <Ionicons
                name={surveyData.healthConditions.includes(condition.value) ? "checkbox" : "square-outline"}
                size={24}
                color={colors.herbalGreen}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderCuisinePreferences = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        Preferred Cuisines <Text style={[styles.inputSubtext, { color: colors.icon, fontSize: 12, fontWeight: 'normal' }]}>(optional)</Text>
      </Text>
      <Text style={[styles.inputSubtext, { color: colors.icon }]}>
        Select your favorite cuisines to personalize your meal plans
      </Text>
      <View style={styles.chipsContainer}>
        {cuisineOptions.map((cuisine) => (
          <TouchableOpacity
            key={cuisine.value}
            style={[
              styles.modernChip,
              {
                backgroundColor: surveyData.preferredCuisine.includes(cuisine.value)
                  ? colors.herbalGreen
                  : colors.lightGreen,
                borderColor: colors.herbalGreen,
              }
            ]}
            onPress={() => toggleCuisine(cuisine.value)}
          >
            <Ionicons 
              name={cuisine.icon as any} 
              size={16} 
              color={surveyData.preferredCuisine.includes(cuisine.value) ? 'white' : colors.herbalGreen} 
            />
            <Text
              style={[
                styles.chipText,
                {
                  color: surveyData.preferredCuisine.includes(cuisine.value)
                    ? 'white'
                    : colors.herbalGreen,
                }
              ]}
            >
              {cuisine.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLifestyleOptions = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        Activity Level <Text style={{ color: colors.softOrange }}>*</Text>
      </Text>
      <TouchableOpacity
        style={[styles.modernDropdownButton, { borderColor: colors.inputBorder, backgroundColor: colors.cardBackground }]}
        onPress={() => setShowLifestyleDropdown(!showLifestyleDropdown)}
      >
        <Ionicons name="bicycle" size={20} color={colors.herbalGreen} />
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {surveyData.lifestyle 
            ? lifestyleOptions.find(option => option.value === surveyData.lifestyle)?.label || 'Select your activity level'
            : 'Select your activity level'}
        </Text>
        <Ionicons
          name={showLifestyleDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.icon}
        />
      </TouchableOpacity>
      {showLifestyleDropdown && (
        <View style={[styles.modernCheckboxContainer, { backgroundColor: colors.cardBackground }]}>
          {lifestyleOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.modernCheckboxItem}
              onPress={() => {
                updateField('lifestyle', option.value);
                setShowLifestyleDropdown(false);
              }}
            >
              <Ionicons name={option.icon as any} size={20} color={colors.herbalGreen} />
              <Text style={[styles.checkboxText, { color: colors.text, flex: 1 }]}>
                {option.label}
              </Text>
              <Ionicons
                name={surveyData.lifestyle === option.value ? "radio-button-on" : "radio-button-off"}
                size={24}
                color={colors.herbalGreen}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderPrakritiQuestion = () => {
    if (currentQuestionIndex >= prakritiQuestions.length) return null;

    const question = prakritiQuestions[currentQuestionIndex];
    
    return (
      <View style={styles.questionContainer}>
        <Text style={[styles.questionNumber, { color: colors.herbalGreen }]}>
          Question {currentQuestionIndex + 1} of {prakritiQuestions.length}
        </Text>
        <Text style={[styles.questionText, { color: colors.text }]}>
          {question.questionText}
        </Text>
        
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.herbalGreen,
                }
              ]}
              onPress={() => handlePrakritiAnswer(index)}
              disabled={loading}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {option.text}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.herbalGreen} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.scoreDisplay}>
          <Text style={[styles.scoreTitle, { color: colors.text }]}>Current Scores:</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: colors.text }]}>Vata</Text>
              <Text style={[styles.scoreValue, { color: '#FF6B6B' }]}>{prakritiScores.vata}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: colors.text }]}>Pitta</Text>
              <Text style={[styles.scoreValue, { color: '#4ECDC4' }]}>{prakritiScores.pitta}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, { color: colors.text }]}>Kapha</Text>
              <Text style={[styles.scoreValue, { color: '#45B7D1' }]}>{prakritiScores.kapha}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPrakritiResults = () => {
    if (!prakritiResult) return null;

    return (
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Ionicons name="leaf" size={48} color={colors.herbalGreen} />
          <Text style={[styles.resultsTitle, { color: colors.text }]}>
            Your Prakriti Type
          </Text>
        </View>

        <View style={[styles.resultsCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.primaryDosha, { color: colors.herbalGreen }]}>
            {prakritiResult.primary}
            {prakritiResult.isDual && prakritiResult.secondary && (
              <Text style={{ color: colors.softOrange }}> - {prakritiResult.secondary}</Text>
            )}
          </Text>
          
          {prakritiResult.isDual && (
            <Text style={[styles.dualMessage, { color: colors.icon }]}>
              You have a dual constitution
            </Text>
          )}

          <View style={styles.percentagesContainer}>
            {Object.entries(prakritiResult.percentages).map(([dosha, percentage]) => (
              <View key={dosha} style={styles.percentageRow}>
                <Text style={[styles.doshaName, { color: colors.text }]}>
                  {dosha.charAt(0).toUpperCase() + dosha.slice(1)}
                </Text>
                <View style={styles.percentageBar}>
                  <View
                    style={[
                      styles.percentageFill,
                      {
                        width: `${Number(percentage)}%` as any,
                        backgroundColor: dosha === 'vata' ? '#FF6B6B' : dosha === 'pitta' ? '#4ECDC4' : '#45B7D1'
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.percentageText, { color: colors.text }]}>
                  {Number(percentage)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AyurvedaPattern color={colors.herbalGreen} opacity={0.05} />
      
      {/* Modern Header */}
      <Animated.View style={[styles.modernHeader, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[colors.herbalGreen, colors.sectionHeader]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={32} color="white" />
              <Text style={styles.modernAppTitle}>
                Ayurahaar Survey
              </Text>
            </View>
            <Text style={styles.modernSubtitle}>
              Help us create your personalized wellness plan
            </Text>
            <View style={styles.progressIndicator}>
              <View style={styles.progressDot} />
              <View style={[styles.progressLine, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
              <View style={[styles.progressDot, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.modernFormCard, { backgroundColor: colors.cardBackground, opacity: fadeAnim }]}>
          
          {currentStep === SurveyStep.BASIC_INFO && (
            <>
              {/* Personal Details Section */}
              {renderSectionHeader('Personal Information', 'person-outline', 'Basic details for your profile')}
              
              {renderInputField(
                'Full Name',
                surveyData.fullName,
                (text) => updateField('fullName', text),
                'person-outline',
                'Enter your full name'
              )}

              {renderInputField(
                'Mobile Number',
                surveyData.mobileNumber,
                (text) => updateField('mobileNumber', text),
                'call-outline',
                '+91 9876543210',
                'phone-pad'
              )}

              {renderAgeSlider()}

              {/* Weight and Height side by side */}
              <View style={styles.rowContainer}>
                <View style={styles.halfInput}>
                  {renderInputField(
                    'Weight (kg)',
                    surveyData.weight,
                    (text) => updateField('weight', text),
                    'fitness-outline',
                    '70',
                    'numeric'
                  )}
                </View>
              </View>

              {renderHeightSelector()}

              {/* Lifestyle Section */}
              {renderSectionHeader('Lifestyle Assessment', 'bicycle-outline', 'Help us understand your daily activity')}
              
              {renderLifestyleOptions()}

              {/* Health Information Section */}
              {renderSectionHeader('Health Profile', 'medical-outline', 'Your health conditions and allergies')}
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Food Allergies & Restrictions</Text>
                <Text style={[styles.inputSubtext, { color: colors.icon }]}>
                  Select all that apply (optional)
                </Text>
                {renderAllergyChips()}
              </View>

              {renderHealthConditions()}

              {/* Cuisine Preferences Section */}
              {renderSectionHeader('Food Preferences', 'restaurant-outline', 'Tell us about your favorite cuisines')}
              
              {renderCuisinePreferences()}
            </>
          )}

          {currentStep === SurveyStep.PRAKRITI_ASSESSMENT && (
            <>
              {renderSectionHeader('Prakriti Assessment', 'leaf-outline', 'Discover your Ayurvedic constitution')}
              {renderPrakritiQuestion()}
            </>
          )}

          {currentStep === SurveyStep.COMPLETE && (
            <>
              {renderSectionHeader('Assessment Complete', 'checkmark-circle-outline', 'Your personalized results')}
              {renderPrakritiResults()}
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Modern Bottom Section */}
      <View style={[styles.modernBottomSection, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.icon }]}>
            {currentStep === SurveyStep.BASIC_INFO && 'Health Assessment'}
            {currentStep === SurveyStep.PRAKRITI_ASSESSMENT && 'Prakriti Assessment'}
            {currentStep === SurveyStep.COMPLETE && 'Assessment Complete'}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              backgroundColor: colors.herbalGreen, 
              width: currentStep === SurveyStep.BASIC_INFO ? '33%' : 
                     currentStep === SurveyStep.PRAKRITI_ASSESSMENT ? '66%' : '100%' 
            }]} />
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={handleNext} 
          style={[styles.modernNextButton, { opacity: loading ? 0.7 : 1 }]} 
          activeOpacity={0.8}
          disabled={loading}
        >
          <LinearGradient
            colors={[colors.herbalGreen, colors.softOrange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Processing...' : (
                currentStep === SurveyStep.BASIC_INFO ? 'Continue to Prakriti' :
                currentStep === SurveyStep.PRAKRITI_ASSESSMENT ? 'Complete Assessment' :
                'Continue to Plan Selection'
              )}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="white" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Modern Header Styles
  modernHeader: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modernAppTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 12,
    color: 'white',
  },
  modernSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  progressLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  
  // Legacy Header Styles (keeping for compatibility)
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  modernFormCard: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Section Header Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 32,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(62, 142, 90, 0.1)',
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },
  
  // Input Styles
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputSubtext: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  
  // Chip Styles
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  modernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1.5,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  customInputContainer: {
    marginTop: 16,
  },
  
  // Dropdown Styles
  modernDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  
  // Checkbox Styles
  modernCheckboxContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(62, 142, 90, 0.1)',
  },
  checkboxContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modernCheckboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(62, 142, 90, 0.05)',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  
  // Bottom Section Styles
  modernBottomSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(62, 142, 90, 0.1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    width: '50%',
    borderRadius: 3,
  },
  modernNextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Age Slider Styles
  sliderContainer: {
    borderWidth: 2,
    borderColor: 'rgba(62, 142, 90, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  sliderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sliderValueText: {
    fontSize: 18,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 10,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Height Selector Styles
  heightUnitToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(62, 142, 90, 0.2)',
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  unitSuffix: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Prakriti Assessment Styles
  questionContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(62, 142, 90, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(62, 142, 90, 0.1)',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3E8E5A',
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(62, 142, 90, 0.2)',
    marginBottom: 12,
    backgroundColor: 'white',
  },
  selectedOption: {
    borderColor: '#3E8E5A',
    backgroundColor: 'rgba(62, 142, 90, 0.1)',
  },
  optionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  scoreContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(62, 142, 90, 0.05)',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreDoshaName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreDoshaValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  primaryType: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3E8E5A',
  },
  
  // Additional Prakriti styles
  optionsContainer: {
    marginTop: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  primaryDosha: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  dualMessage: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  percentagesContainer: {
    marginTop: 16,
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doshaName: {
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  percentageBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 45,
    textAlign: 'right',
  },
});
