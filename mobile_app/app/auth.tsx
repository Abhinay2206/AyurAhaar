import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { AyurvedaPattern } from '@/src/components/common/AyurvedaPattern';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { AuthService } from '@/src/services/auth';
import { testApiConnection, resetApiUrlCache, rediscoverApiUrl } from '@/src/services/api';

type AuthMode = 'login' | 'register';
type RegisterMode = 'patient' | 'doctor';

interface LoginData {
  emailOrPhone: string;
  password: string;
}

interface PatientSignUpData {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface DoctorSignUpData {
  fullName: string;
  mobileNumber: string;
  email: string;
  specialization: string;
  registrationNumber: string;
  hospitalClinic: string;
  experience: string;
  password: string;
  confirmPassword: string;
}

const specializationOptions = [
  'General Ayurveda Physician',
  'Panchakarma Specialist',
  'Kayachikitsa (Internal Medicine)',
  'Shalakya Tantra (ENT & Ophthalmology)',
  'Shalya Tantra (Surgery)',
  'Prasuti Tantra (Gynecology & Obstetrics)',
  'Kaumarbhritya (Pediatrics)',
  'Agada Tantra (Toxicology)',
  'Bhuta Vidya (Psychiatry)',
  'Rasayana & Vajikarana (Rejuvenation)',
  'Swasthavritta (Preventive Medicine)',
  'Yoga & Naturopathy'
];

export default function AuthScreen() {
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

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [registerMode, setRegisterMode] = useState<RegisterMode>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);

  const [loginData, setLoginData] = useState<LoginData>({
    emailOrPhone: '',
    password: '',
  });

  const [patientData, setPatientData] = useState<PatientSignUpData>({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [doctorData, setDoctorData] = useState<DoctorSignUpData>({
    fullName: '',
    mobileNumber: '',
    email: '',
    specialization: '',
    registrationNumber: '',
    hospitalClinic: '',
    experience: '',
    password: '',
    confirmPassword: '',
  });

  const updateLoginData = (field: keyof LoginData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
  };

  const updatePatientData = (field: keyof PatientSignUpData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const updateDoctorData = (field: keyof DoctorSignUpData, value: string) => {
    setDoctorData(prev => ({ ...prev, [field]: value }));
  };

  const testApiDebug = async () => {
    console.log('🔧 Testing API connection...');
    const result = await testApiConnection();
    Alert.alert(
      'API Test Result',
      `Success: ${result.success}
URL: ${result.url}
Discovered IP: ${result.discoveredIp || 'None'}
Error: ${result.error || 'None'}`,
      [
        { text: 'Rediscover', onPress: async () => {
          console.log('🔄 Triggering IP rediscovery...');
          await rediscoverApiUrl();
        }},
        { text: 'Reset Cache', onPress: () => {
          resetApiUrlCache();
          console.log('🔄 API cache reset');
        }},
        { text: 'OK' }
      ]
    );
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobile = (mobile: string) => {
    return /^[6-9]\d{9}$/.test(mobile.replace(/\D/g, ''));
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const handleLogin = async () => {
    console.log('🔐 handleLogin called');
    if (!loginData.emailOrPhone.trim()) {
      Alert.alert('Missing Information', 'Please enter your email or phone number');
      return;
    }
    if (!loginData.password.trim()) {
      Alert.alert('Missing Information', 'Please enter your password');
      return;
    }

    console.log('📤 Attempting login with:', loginData.emailOrPhone);
    try {
      const success = await AuthService.handleLoginFlow(loginData.emailOrPhone, loginData.password);
      
      if (!success) {
        Alert.alert('Login Failed', 'Invalid credentials. Please check your email and password.');
      }
      // Success case is handled by AuthService (redirects automatically)
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handlePatientSignUp = async () => {
    console.log('📝 handlePatientSignUp called');
    const { fullName, mobileNumber, email, password, confirmPassword } = patientData;
    
    if (!fullName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return;
    }
    if (!mobileNumber.trim() || !validateMobile(mobileNumber)) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    console.log('📤 Attempting registration for:', email);
    try {
      const userData = {
        name: fullName,
        phone: mobileNumber,
        email,
        password,
        role: 'patient'
      };

      const success = await AuthService.handleRegistrationFlow(userData);
      
      if (!success) {
        Alert.alert('Registration Failed', 'Unable to create account. Please try again.');
      }
      // Success case is handled by AuthService (redirects to survey)
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleDoctorSignUp = () => {
    const { fullName, mobileNumber, email, specialization, registrationNumber, hospitalClinic, experience, password, confirmPassword } = doctorData;
    
    if (!fullName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return;
    }
    if (!mobileNumber.trim() || !validateMobile(mobileNumber)) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!specialization) {
      Alert.alert('Missing Information', 'Please select your specialization');
      return;
    }
    if (!registrationNumber.trim() || registrationNumber.length < 8) {
      Alert.alert('Invalid Registration', 'Please enter a valid MCI/AYUSH registration number');
      return;
    }
    if (!hospitalClinic.trim()) {
      Alert.alert('Missing Information', 'Please enter your hospital/clinic name');
      return;
    }
    if (!experience.trim() || parseInt(experience) < 0) {
      Alert.alert('Invalid Experience', 'Please enter your years of experience');
      return;
    }
    if (!validatePassword(password)) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }
    
    Alert.alert(
      'Verification Required', 
      'Thank you for registering! Your doctor profile will be verified within 24-48 hours. You will receive an email confirmation once approved by our medical board.',
      [{ text: 'Understood', onPress: () => setAuthMode('login') }]
    );
  };

  const handleGoogleSignIn = () => {
    if (authMode !== 'register' || registerMode !== 'patient') {
      Alert.alert('Not Available', 'Google sign-in is only available for patient registration');
      return;
    }
    Alert.alert('Google Sign-In', 'Redirecting to Google authentication...', [
      { text: 'Continue', onPress: () => router.push('/plan-selection') }
    ]);
  };

    const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: authMode === 'login' ? colors.herbalGreen : 'transparent',
            borderColor: colors.herbalGreen,
          }
        ]}
        onPress={() => setAuthMode('login')}
      >
        <Text style={[
          styles.tabText,
          { color: authMode === 'login' ? 'white' : colors.herbalGreen }
        ]}>
          Login
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          {
            backgroundColor: authMode === 'register' ? colors.herbalGreen : 'transparent',
            borderColor: colors.herbalGreen,
          }
        ]}
        onPress={() => setAuthMode('register')}
      >
        <Text style={[
          styles.tabText,
          { color: authMode === 'register' ? 'white' : colors.herbalGreen }
        ]}>
          Register
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterTabs = () => (
    <View style={styles.subTabContainer}>
      <TouchableOpacity
        style={[
          styles.subTab,
          {
            backgroundColor: registerMode === 'patient' ? colors.herbalGreen : 'transparent',
            borderColor: colors.herbalGreen,
          }
        ]}
        onPress={() => setRegisterMode('patient')}
      >
        <Text style={[
          styles.subTabText,
          { color: registerMode === 'patient' ? 'white' : colors.herbalGreen }
        ]}>
          Patient
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.subTab,
          {
            backgroundColor: registerMode === 'doctor' ? colors.herbalGreen : 'transparent',
            borderColor: colors.herbalGreen,
          }
        ]}
        onPress={() => setRegisterMode('doctor')}
      >
        <Text style={[
          styles.subTabText,
          { color: registerMode === 'doctor' ? 'white' : colors.herbalGreen }
        ]}>
          Doctor
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: string,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'phone-pad' | 'email-address' = 'default',
    secureTextEntry: boolean = false,
    required: boolean = true,
    fieldType: string = 'default'
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
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          maxLength={keyboardType === 'phone-pad' ? 10 : undefined}
        />
        {fieldType === 'password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}
        {fieldType === 'confirmPassword' && (
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}
        {value && !secureTextEntry ? (
          <Ionicons name="checkmark-circle" size={20} color={colors.herbalGreen} />
        ) : null}
      </View>
    </View>
  );



  const renderDropdownField = (
    label: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void,
    icon: string,
    placeholder: string,
    isOpen: boolean,
    onToggle: () => void,
    required: boolean = true
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>
        {label} {required && <Text style={{ color: colors.softOrange }}>*</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { 
            borderColor: value ? colors.herbalGreen : colors.inputBorder,
            backgroundColor: colors.cardBackground 
          }
        ]}
        onPress={onToggle}
      >
        <Ionicons name={icon as any} size={20} color={colors.herbalGreen} />
        <Text style={[
          styles.dropdownText,
          { 
            color: value ? colors.text : colors.icon,
            fontWeight: value ? '500' : '400'
          }
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.icon}
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.dropdownList, { backgroundColor: colors.cardBackground, borderColor: colors.inputBorder }]}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dropdownItem,
                { borderBottomColor: colors.inputBorder }
              ]}
              onPress={() => {
                onSelect(option);
                onToggle();
              }}
            >
              <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      {renderInputField(
        'Email or Phone',
        loginData.emailOrPhone,
        (text) => updateLoginData('emailOrPhone', text),
        'person-outline',
        'Enter your email or phone number',
        'default'
      )}

      {renderInputField(
        'Password',
        loginData.password,
        (text) => updateLoginData('password', text),
        'lock-closed-outline',
        'Enter your password',
        'default',
        !showPassword
      )}

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={[styles.forgotPasswordText, { color: colors.herbalGreen }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.herbalGreen, colors.softOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPatientSignUpForm = () => (
    <View style={styles.formContainer}>
      <Text style={[styles.formDescription, { color: colors.icon }]}>
        Create your patient account to get personalized Ayurvedic nutrition plans
      </Text>

      {renderInputField(
        'Full Name',
        patientData.fullName,
        (text) => updatePatientData('fullName', text),
        'person-outline',
        'Enter your full name'
      )}

      {renderInputField(
        'Mobile Number',
        patientData.mobileNumber,
        (text) => updatePatientData('mobileNumber', text.replace(/\D/g, '')),
        'call-outline',
        '10-digit mobile number',
        'phone-pad'
      )}

      {renderInputField(
        'Email Address',
        patientData.email,
        (text) => updatePatientData('email', text.toLowerCase()),
        'mail-outline',
        'your.email@example.com',
        'email-address'
      )}

      {renderInputField(
        'Password',
        patientData.password,
        (text) => updatePatientData('password', text),
        'lock-closed-outline',
        'Minimum 8 characters',
        'default',
        !showPassword
      )}

      {renderInputField(
        'Confirm Password',
        patientData.confirmPassword,
        (text) => updatePatientData('confirmPassword', text),
        'lock-closed-outline',
        'Re-enter your password',
        'default',
        !showConfirmPassword,
        true,
        'confirmPassword'
      )}

      <View style={styles.passwordRequirements}>
        <Text style={[styles.requirementText, { color: colors.icon }]}>
          Password must contain:
        </Text>
        <View style={styles.requirementItem}>
          <Ionicons 
            name={patientData.password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={patientData.password.length >= 8 ? colors.herbalGreen : colors.icon} 
          />
          <Text style={[styles.requirementItemText, { color: colors.icon }]}>
            At least 8 characters
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons 
            name={/[A-Z]/.test(patientData.password) ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={/[A-Z]/.test(patientData.password) ? colors.herbalGreen : colors.icon} 
          />
          <Text style={[styles.requirementItemText, { color: colors.icon }]}>
            One uppercase letter
          </Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons 
            name={/\d/.test(patientData.password) ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={/\d/.test(patientData.password) ? colors.herbalGreen : colors.icon} 
          />
          <Text style={[styles.requirementItemText, { color: colors.icon }]}>
            One number
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handlePatientSignUp}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.herbalGreen, colors.softOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.primaryButtonText}>Create Patient Account</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Debug button for development */}
      {__DEV__ && (
        <TouchableOpacity
          style={[styles.debugButton]}
          onPress={testApiDebug}
          activeOpacity={0.8}
        >
          <Text style={styles.debugButtonText}>🔧 Test API Connection</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDoctorSignUpForm = () => (
    <View style={styles.formContainer}>
      {renderInputField(
        'Full Name',
        doctorData.fullName,
        (text) => updateDoctorData('fullName', text),
        'person-outline',
        'Enter your full name'
      )}

      {renderInputField(
        'Mobile Number',
        doctorData.mobileNumber,
        (text) => updateDoctorData('mobileNumber', text),
        'call-outline',
        '+91 9876543210',
        'phone-pad'
      )}

      {renderInputField(
        'Email Address',
        doctorData.email,
        (text) => updateDoctorData('email', text),
        'mail-outline',
        'doctor@example.com',
        'email-address'
      )}

      {renderDropdownField(
        'Specialization',
        doctorData.specialization,
        specializationOptions,
        (value) => updateDoctorData('specialization', value),
        'medical-outline',
        'Select your specialization',
        showSpecializationDropdown,
        () => setShowSpecializationDropdown(!showSpecializationDropdown)
      )}

      {renderInputField(
        'Medical Registration Number',
        doctorData.registrationNumber,
        (text) => updateDoctorData('registrationNumber', text),
        'card-outline',
        'MCI/AYUSH Registration ID'
      )}

      {renderInputField(
        'Hospital/Clinic Name',
        doctorData.hospitalClinic,
        (text) => updateDoctorData('hospitalClinic', text),
        'business-outline',
        'Enter hospital or clinic name'
      )}

      {renderInputField(
        'Password',
        doctorData.password,
        (text) => updateDoctorData('password', text),
        'lock-closed-outline',
        'Create a strong password',
        'default',
        !showPassword
      )}

      <View style={styles.disclaimerContainer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.softOrange} />
        <Text style={[styles.disclaimerText, { color: colors.icon }]}>
          For registered Indian Ayurveda doctors only. Verification required.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleDoctorSignUp}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.herbalGreen, colors.softOrange]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.primaryButtonText}>Create Doctor Account</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderGoogleSignIn = () => (
    <View style={styles.googleContainer}>
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />
        <Text style={[styles.dividerText, { color: colors.icon }]}>OR</Text>
        <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />
      </View>

      <TouchableOpacity
        style={[styles.googleButton, { borderColor: colors.inputBorder, backgroundColor: colors.cardBackground }]}
        onPress={handleGoogleSignIn}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-google" size={20} color="#EA4335" />
        <Text style={[styles.googleButtonText, { color: colors.text }]}>
          Continue with Google
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AyurvedaPattern color={colors.herbalGreen} opacity={0.03} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={48} color={colors.herbalGreen} />
              <View style={styles.titleContainer}>
                <Text style={[styles.appTitle, { color: colors.herbalGreen }]}>
                  Ayurahaar
                </Text>
                <Text style={[styles.appSubtitle, { color: colors.sectionHeader }]}>
                  Personalized Ayurveda Nutrition
                </Text>
              </View>
            </View>
          </View>

          {/* Auth Tabs */}
          {renderTabs()}

          {/* Register Sub-tabs (only show when register is selected) */}
          {authMode === 'register' && renderRegisterTabs()}

          {/* Forms */}
          <View style={[styles.formCard, { backgroundColor: colors.cardBackground }]}>
            {authMode === 'login' && renderLoginForm()}
            {authMode === 'register' && registerMode === 'patient' && renderPatientSignUpForm()}
            {authMode === 'register' && registerMode === 'doctor' && renderDoctorSignUpForm()}
          </View>

          {/* Google Sign In (only for patients) */}
          {authMode === 'register' && registerMode === 'patient' && renderGoogleSignIn()}

          {/* Terms and Privacy */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.icon }]}>
              By continuing, you agree to our{' '}
              <Text style={[styles.termsLink, { color: colors.herbalGreen }]}>
                Terms & Privacy Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(62, 142, 90, 0.1)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
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
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(244, 162, 97, 0.1)',
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 8,
  },
  gradientButton: {
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
    fontWeight: '700',
  },
  googleContainer: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  formDescription: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  passwordRequirements: {
    marginTop: 10,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 195, 74, 0.3)',
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementItemText: {
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  disclaimerContent: {
    flex: 1,
    marginLeft: 10,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  subTabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
    backgroundColor: 'rgba(139, 195, 74, 0.1)',
    padding: 4,
  },
  subTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 2,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
