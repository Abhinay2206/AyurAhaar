import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { AyurvedaPattern } from '@/components/AyurvedaPattern';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface SurveyData {
  fullName: string;
  mobileNumber: string;
  age: string;
  weight: string;
  height: string;
  lifestyle: string;
  allergies: string[];
  healthConditions: string[];
  customAllergies: string; // Add this for custom allergies
}

const lifestyleOptions = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Active', value: 'active' },
  { label: 'Very Active', value: 'very_active' },
];

const allergyOptions = [
  'None', 'Dairy', 'Nuts', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Fish', 'Sesame', 'Other'
];

const healthConditionOptions = [
  'Diabetes', 'High Blood Pressure', 'PCOS', 'Obesity', 'Heart Disease', 'Thyroid', 'None'
];

export default function SurveyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [surveyData, setSurveyData] = useState<SurveyData>({
    fullName: '',
    mobileNumber: '',
    age: '',
    weight: '',
    height: '',
    lifestyle: '',
    allergies: [],
    healthConditions: [],
    customAllergies: '',
  });

  const [showHealthConditions, setShowHealthConditions] = useState(false);
  const [showCustomAllergyInput, setShowCustomAllergyInput] = useState(false);
  const [showLifestyleDropdown, setShowLifestyleDropdown] = useState(false);

  const updateField = (field: keyof SurveyData, value: string | string[]) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      // If "None" is selected, clear all other allergies
      updateField('allergies', ['None']);
      updateField('customAllergies', '');
      setShowCustomAllergyInput(false);
      return;
    }
    
    if (allergy === 'Other') {
      setShowCustomAllergyInput(true);
      if (!surveyData.allergies.includes('Other')) {
        const newAllergies = surveyData.allergies.filter(a => a !== 'None');
        updateField('allergies', [...newAllergies, 'Other']);
      }
      return;
    }
    
    // For other allergies, remove "None" if it was selected
    let newAllergies = surveyData.allergies.filter(a => a !== 'None');
    
    if (newAllergies.includes(allergy)) {
      newAllergies = newAllergies.filter(a => a !== allergy);
    } else {
      newAllergies = [...newAllergies, allergy];
    }
    
    updateField('allergies', newAllergies);
  };

  const toggleHealthCondition = (condition: string) => {
    const newConditions = surveyData.healthConditions.includes(condition)
      ? surveyData.healthConditions.filter(c => c !== condition)
      : [...surveyData.healthConditions, condition];
    updateField('healthConditions', newConditions);
  };

  const validateForm = () => {
    const { fullName, mobileNumber, age, weight, height, lifestyle } = surveyData;
    
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return false;
    }
    if (!age.trim() || parseInt(age) < 1 || parseInt(age) > 120) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }
    if (!weight.trim() || parseFloat(weight) < 1) {
      Alert.alert('Error', 'Please enter a valid weight');
      return false;
    }
    if (!height.trim() || parseFloat(height) < 1) {
      Alert.alert('Error', 'Please enter a valid height');
      return false;
    }
    if (!lifestyle) {
      Alert.alert('Error', 'Please select your lifestyle');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      Alert.alert('Success', 'Survey data saved! Proceeding to next step...');
      // Navigate to next screen or process data
    }
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={24} color={colors.herbalGreen} />
      <Text style={[styles.sectionTitle, { color: colors.sectionHeader }]}>
        {title}
      </Text>
    </View>
  );

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
      <View style={[styles.inputWrapper, { borderColor: colors.inputBorder }]}>
        <Ionicons name={icon as any} size={20} color={colors.herbalGreen} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

  const renderAllergyChips = () => (
    <View>
      <View style={styles.chipsContainer}>
        {allergyOptions.map((allergy) => (
          <TouchableOpacity
            key={allergy}
            style={[
              styles.chip,
              {
                backgroundColor: surveyData.allergies.includes(allergy)
                  ? colors.herbalGreen
                  : colors.lightGreen,
                borderColor: colors.herbalGreen,
              }
            ]}
            onPress={() => toggleAllergy(allergy)}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: surveyData.allergies.includes(allergy)
                    ? 'white'
                    : colors.herbalGreen,
                }
              ]}
            >
              {allergy}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Custom allergy input */}
      {showCustomAllergyInput && surveyData.allergies.includes('Other') && !surveyData.allergies.includes('None') && (
        <View style={styles.customInputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text, fontSize: 12 }]}>
            Please specify other allergies:
          </Text>
          <View style={[styles.inputWrapper, { borderColor: colors.inputBorder }]}>
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
        style={[styles.dropdownButton, { borderColor: colors.inputBorder }]}
        onPress={() => setShowHealthConditions(!showHealthConditions)}
      >
        <Ionicons name="medical" size={20} color={colors.herbalGreen} />
        <Text style={[styles.dropdownText, { color: colors.text }]}>
          {surveyData.healthConditions.length > 0
            ? `${surveyData.healthConditions.length} selected`
            : 'Select health conditions'}
        </Text>
        <Ionicons
          name={showHealthConditions ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.icon}
        />
      </TouchableOpacity>
      {showHealthConditions && (
        <View style={styles.checkboxContainer}>
          {healthConditionOptions.map((condition) => (
            <TouchableOpacity
              key={condition}
              style={styles.checkboxItem}
              onPress={() => toggleHealthCondition(condition)}
            >
              <Ionicons
                name={surveyData.healthConditions.includes(condition) ? "checkbox" : "square-outline"}
                size={24}
                color={colors.herbalGreen}
              />
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                {condition}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AyurvedaPattern color={colors.herbalGreen} opacity={0.03} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.lightGreen }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={32} color={colors.herbalGreen} />
          <Text style={[styles.appTitle, { color: colors.herbalGreen }]}>
            Ayurahaar Survey
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.sectionHeader }]}>
          Help us create your personalized diet plan
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.formCard, { backgroundColor: colors.cardBackground }]}>
          
          {/* Personal Details Section */}
          {renderSectionHeader('Personal Details', 'person')}
          
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

          {renderInputField(
            'Age',
            surveyData.age,
            (text) => updateField('age', text),
            'calendar-outline',
            'Enter your age',
            'numeric'
          )}

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
            <View style={styles.halfInput}>
              {renderInputField(
                'Height (cm)',
                surveyData.height,
                (text) => updateField('height', text),
                'resize-outline',
                '170',
                'numeric'
              )}
            </View>
          </View>

          {/* Lifestyle Section */}
          {renderSectionHeader('Lifestyle Information', 'bicycle')}
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Lifestyle <Text style={{ color: colors.softOrange }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.dropdownButton, { borderColor: colors.inputBorder }]}
              onPress={() => setShowLifestyleDropdown(!showLifestyleDropdown)}
            >
              <Ionicons name="bicycle" size={20} color={colors.herbalGreen} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {surveyData.lifestyle 
                  ? lifestyleOptions.find(option => option.value === surveyData.lifestyle)?.label || 'Select your lifestyle'
                  : 'Select your lifestyle'}
              </Text>
              <Ionicons
                name={showLifestyleDropdown ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
            {showLifestyleDropdown && (
              <View style={styles.checkboxContainer}>
                {lifestyleOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.checkboxItem}
                    onPress={() => {
                      updateField('lifestyle', option.value);
                      setShowLifestyleDropdown(false);
                    }}
                  >
                    <Ionicons
                      name={surveyData.lifestyle === option.value ? "radio-button-on" : "radio-button-off"}
                      size={24}
                      color={colors.herbalGreen}
                    />
                    <Text style={[styles.checkboxText, { color: colors.text }]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Health Information Section */}
          {renderSectionHeader('Health Information', 'medical')}
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Allergies</Text>
            <Text style={[styles.inputSubtext, { color: colors.icon }]}>
              Select all that apply (optional)
            </Text>
            {renderAllergyChips()}
          </View>

          {renderHealthConditions()}
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { backgroundColor: colors.background }]}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.icon }]}>
            Step 1 of 2
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { backgroundColor: colors.herbalGreen }]} />
          </View>
        </View>
        
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={[colors.herbalGreen, colors.softOrange]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(62, 142, 90, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputSubtext: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  customInputContainer: {
    marginTop: 12,
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
    marginLeft: 8,
  },
  checkboxContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 8,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    width: '50%',
    borderRadius: 2,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
