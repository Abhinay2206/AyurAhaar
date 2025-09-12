import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
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
import { surveyApi } from '@/src/services/api';

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

export default function SurveyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
  });

  const [showHealthConditions, setShowHealthConditions] = useState(false);
  const [showCustomAllergyInput, setShowCustomAllergyInput] = useState(false);
  const [showLifestyleDropdown, setShowLifestyleDropdown] = useState(false);

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
    if (validateForm()) {
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
        };

        const response = await surveyApi.submitSurvey(submissionData);

        if (response.success) {
          Alert.alert(
            'Success!', 
            'Your health survey has been completed successfully. We will now create your personalized Ayurvedic diet plan.',
            [
              {
                text: 'Continue',
                onPress: () => {
                  AuthService.handleSurveyCompletion();
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', response.error || 'Failed to submit survey. Please try again.');
        }
      } catch (error) {
        console.error('Survey submission error:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
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
        </Animated.View>
      </ScrollView>

      {/* Modern Bottom Section */}
      <View style={[styles.modernBottomSection, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.icon }]}>
            Health Assessment Complete
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { backgroundColor: colors.herbalGreen, width: '100%' }]} />
          </View>
        </View>
        
        <TouchableOpacity onPress={handleNext} style={styles.modernNextButton} activeOpacity={0.8}>
          <LinearGradient
            colors={[colors.herbalGreen, colors.softOrange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextButtonText}>Generate My Diet Plan</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
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
});
