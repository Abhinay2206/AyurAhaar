import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Card
} from '../../components';
import { AuthService } from '../../services';

const DoctorRegistrationScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Professional Information
    specialization: '',
    licenseNumber: '',
    experience: '',
    location: '',
    
    // Additional Information
    qualification: '',
    clinicName: '',
    consultationFee: '',
    about: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const specializations = [
    'General Ayurvedic Medicine',
    'Panchakarma Specialist',
    'Ayurvedic Dermatology',
    'Ayurvedic Cardiology',
    'Ayurvedic Pediatrics',
    'Ayurvedic Gynecology',
    'Ayurvedic Orthopedics',
    'Ayurvedic Psychiatry',
    'Ayurvedic Nutrition',
    'Ayurvedic Surgery',
    'Other'
  ];

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
        general: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Personal Information validation
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 2) {
      // Professional Information validation
      if (!formData.specialization) {
        newErrors.specialization = 'Specialization is required';
      }

      if (!formData.licenseNumber.trim()) {
        newErrors.licenseNumber = 'Medical license number is required';
      }

      if (!formData.experience) {
        newErrors.experience = 'Years of experience is required';
      } else if (isNaN(formData.experience) || formData.experience < 0 || formData.experience > 50) {
        newErrors.experience = 'Please enter a valid number of years (0-50)';
      }

      if (!formData.location.trim()) {
        newErrors.location = 'Practice location is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await AuthService.registerDoctor({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber.trim(),
        experience: parseInt(formData.experience),
        location: formData.location.trim(),
        qualification: formData.qualification.trim(),
        clinicName: formData.clinicName.trim(),
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : undefined,
        about: formData.about.trim()
      });

      if (result.success) {
        // Redirect to dashboard
        navigate(result.redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        general: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-primary)',
    background: 'var(--medical-gradient-bg)',
    padding: '2rem',
    position: 'relative',
  };

  const backgroundPatternStyles = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 25% 25%, rgba(var(--medical-primary-rgb), 0.05) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(var(--medical-secondary-rgb), 0.05) 0%, transparent 50%)
    `,
    zIndex: 0,
  };

  const formContainerStyles = {
    width: '100%',
    maxWidth: '520px',
    zIndex: 1,
    position: 'relative',
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const logoContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, var(--medical-primary-light), var(--medical-primary))',
    borderRadius: 'var(--radius-xl)',
    color: 'var(--medical-white)',
    boxShadow: 'var(--medical-shadow-lg)',
  };

  const titleStyles = {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: 'var(--medical-white)',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-primary)',
    letterSpacing: '0.025em',
  };

  const subtitleStyles = {
    fontSize: '1rem',
    color: 'var(--medical-gray-700)',
    fontWeight: '600',
    fontFamily: 'var(--font-primary)',
    marginBottom: '0.5rem',
  };

  const descriptionStyles = {
    fontSize: '0.875rem',
    color: 'var(--medical-gray-600)',
    fontWeight: '400',
    fontFamily: 'var(--font-primary)',
    lineHeight: '1.5',
    textAlign: 'center',
  };

  const stepIndicatorStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '1rem',
  };

  const stepStyles = {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all var(--transition-base)',
  };

  const activeStepStyles = {
    ...stepStyles,
    backgroundColor: 'var(--medical-primary)',
    color: 'var(--medical-white)',
    boxShadow: '0 0 0 4px rgba(var(--medical-primary-rgb), 0.2)',
  };

  const completedStepStyles = {
    ...stepStyles,
    backgroundColor: 'var(--medical-success)',
    color: 'var(--medical-white)',
  };

  const inactiveStepStyles = {
    ...stepStyles,
    backgroundColor: 'var(--medical-gray-200)',
    color: 'var(--medical-gray-500)',
  };

  const stepConnectorStyles = {
    width: '3rem',
    height: '2px',
    backgroundColor: currentStep > 1 ? 'var(--medical-success)' : 'var(--medical-gray-300)',
    transition: 'all var(--transition-base)',
  };

  const buttonGroupStyles = {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  };

  const footerStyles = {
    textAlign: 'center',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--medical-gray-200)',
  };

  const linkStyles = {
    color: 'var(--medical-primary)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all var(--transition-base)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.25rem 0.5rem',
  };

  const renderPersonalInfoStep = () => (
    <>
      <Input
        label="Full Name"
        type="text"
        placeholder="Dr. Full Name"
        value={formData.name}
        onChange={handleInputChange('name')}
        error={errors.name}
        required={true}
        size="medium"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        }
      />

      <Input
        label="Professional Email"
        type="email"
        placeholder="doctor@hospital.com"
        value={formData.email}
        onChange={handleInputChange('email')}
        error={errors.email}
        required={true}
        size="medium"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        }
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="1234567890"
        value={formData.phone}
        onChange={handleInputChange('phone')}
        error={errors.phone}
        required={true}
        size="medium"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        }
      />

      <Input
        label="Password"
        type="password"
        placeholder="Strong password (min 6 characters)"
        value={formData.password}
        onChange={handleInputChange('password')}
        error={errors.password}
        showPasswordToggle={true}
        required={true}
        size="medium"
        helperText="Must contain uppercase, lowercase, and number"
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        error={errors.confirmPassword}
        showPasswordToggle={true}
        required={true}
        size="medium"
      />
    </>
  );

  const renderProfessionalInfoStep = () => (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--medical-gray-700)'
        }}>
          Specialization *
        </label>
        <select
          value={formData.specialization}
          onChange={handleInputChange('specialization')}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${errors.specialization ? 'var(--medical-error)' : 'var(--medical-gray-300)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            backgroundColor: 'var(--medical-white)',
            transition: 'all var(--transition-base)',
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--medical-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(var(--medical-primary-rgb), 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = errors.specialization ? 'var(--medical-error)' : 'var(--medical-gray-300)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">Select your specialization</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
        {errors.specialization && (
          <p style={{
            color: 'var(--medical-error)',
            fontSize: '0.75rem',
            marginTop: '0.25rem'
          }}>
            {errors.specialization}
          </p>
        )}
      </div>

      <Input
        label="Medical License Number"
        type="text"
        placeholder="Enter your license number"
        value={formData.licenseNumber}
        onChange={handleInputChange('licenseNumber')}
        error={errors.licenseNumber}
        required={true}
        size="medium"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
        }
      />

      <Input
        label="Years of Experience"
        type="number"
        placeholder="5"
        value={formData.experience}
        onChange={handleInputChange('experience')}
        error={errors.experience}
        required={true}
        size="medium"
        min="0"
        max="50"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11A1.5,1.5 0 0,1 10.5,9.5A1.5,1.5 0 0,1 12,8A1.5,1.5 0 0,1 13.5,9.5A1.5,1.5 0 0,1 12,11Z"/>
          </svg>
        }
      />

      <Input
        label="Practice Location"
        type="text"
        placeholder="City, State"
        value={formData.location}
        onChange={handleInputChange('location')}
        error={errors.location}
        required={true}
        size="medium"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
          </svg>
        }
      />
    </>
  );

  const renderAdditionalInfoStep = () => (
    <>
      <Input
        label="Qualification (Optional)"
        type="text"
        placeholder="BAMS, MD, etc."
        value={formData.qualification}
        onChange={handleInputChange('qualification')}
        size="medium"
      />

      <Input
        label="Clinic/Hospital Name (Optional)"
        type="text"
        placeholder="Name of your practice"
        value={formData.clinicName}
        onChange={handleInputChange('clinicName')}
        size="medium"
      />

      <Input
        label="Consultation Fee (Optional)"
        type="number"
        placeholder="500"
        value={formData.consultationFee}
        onChange={handleInputChange('consultationFee')}
        size="medium"
        min="0"
        icon={
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>₹</span>
        }
      />

      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--medical-gray-700)'
        }}>
          About Yourself (Optional)
        </label>
        <textarea
          value={formData.about}
          onChange={handleInputChange('about')}
          placeholder="Tell patients about your expertise and approach to Ayurvedic medicine..."
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--medical-gray-300)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            backgroundColor: 'var(--medical-white)',
            transition: 'all var(--transition-base)',
            outline: 'none',
            resize: 'vertical'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--medical-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(var(--medical-primary-rgb), 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--medical-gray-300)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </>
  );

  return (
    <div style={containerStyles}>
      <div style={backgroundPatternStyles} />
      
      <div style={formContainerStyles}>
        <Card medical={true} padding="large" hover={false}>
          <div style={headerStyles}>
            <div style={logoContainerStyles}>
              <h1 style={titleStyles}>AyurAhaar</h1>
            </div>
            <p style={subtitleStyles}>Doctor Registration</p>
            <p style={descriptionStyles}>
              Join our platform to provide personalized Ayurvedic care and meal planning to patients
            </p>
          </div>

          {/* Step Indicator */}
          <div style={stepIndicatorStyles}>
            <div style={currentStep >= 1 ? (currentStep > 1 ? completedStepStyles : activeStepStyles) : inactiveStepStyles}>
              1
            </div>
            <div style={stepConnectorStyles}></div>
            <div style={currentStep >= 2 ? (currentStep > 2 ? completedStepStyles : activeStepStyles) : inactiveStepStyles}>
              2
            </div>
            <div style={{
              ...stepConnectorStyles,
              backgroundColor: currentStep > 2 ? 'var(--medical-success)' : 'var(--medical-gray-300)'
            }}></div>
            <div style={currentStep >= 3 ? activeStepStyles : inactiveStepStyles}>
              3
            </div>
          </div>

          <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step Content */}
            {currentStep === 1 && renderPersonalInfoStep()}
            {currentStep === 2 && renderProfessionalInfoStep()}
            {currentStep === 3 && renderAdditionalInfoStep()}

            {/* General Error Display */}
            {errors.general && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: 'var(--medical-error-light)',
                border: '1px solid var(--medical-error)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--medical-error-dark)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {errors.general}
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={buttonGroupStyles}>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handleNext}
                  disabled={isLoading}
                  style={{ flex: 1 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={isLoading}
                  loading={isLoading}
                  style={{ flex: 1 }}
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </form>

          <div style={footerStyles}>
            <p style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)', marginBottom: '1rem' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--medical-primary-light)';
                  e.target.style.color = 'var(--medical-white)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--medical-primary)';
                }}
              >
                Sign In Here
              </Link>
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--medical-gray-500)', lineHeight: '1.4' }}>
              By registering, you agree to our{' '}
              <a href="#" style={linkStyles}>Terms of Service</a> and{' '}
              <a href="#" style={linkStyles}>Privacy Policy</a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorRegistrationScreen;