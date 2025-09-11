import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card
} from '../../components';
import { colors, typography, spacing } from '../../theme';

const LoginScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email or mobile number is required';
    } else if (formData.email.includes('@') && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Login attempt:', formData);
      setIsLoading(false);
      // Handle success/error here
    }, 2000);
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign-in clicked');
    // Implement Google Sign-in logic
  };

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.primary,
    backgroundColor: colors.secondary.lightCream,
    padding: spacing.lg,
  };

  const formContainerStyles = {
    width: '100%',
    maxWidth: '360px',
    zIndex: 1,
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: spacing.md,
  };

  const logoContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  };

  const titleStyles = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.herbalGreen,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.primary,
  };

  const subtitleStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.secondary.charcoal,
    fontWeight: typography.fontWeight.normal,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing.xs,
  };

  const descriptionStyles = {
    fontSize: typography.fontSize.xs,
    color: colors.secondary.slate,
    fontWeight: typography.fontWeight.normal,
    fontFamily: typography.fontFamily.primary,
    lineHeight: typography.lineHeight.normal,
  };

  const forgotPasswordStyles = {
    textAlign: 'right',
    marginBottom: spacing.md,
  };

  const linkStyles = {
    color: colors.primary.herbalGreen,
    textDecoration: 'none',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    transition: 'all 0.3s ease',
  };

  const dividerStyles = {
    display: 'flex',
    alignItems: 'center',
    margin: `${spacing.md} 0`,
    color: colors.secondary.mediumGray,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
  };

  const dividerLineStyles = {
    flex: 1,
    height: '1px',
    backgroundColor: colors.secondary.mediumGray,
  };

  const dividerTextStyles = {
    padding: `0 ${spacing.lg}`,
    backgroundColor: colors.secondary.white,
    color: colors.secondary.slate,
    fontWeight: typography.fontWeight.medium,
  };

  const footerStyles = {
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.sm,
    borderTop: `1px solid ${colors.secondary.warmGray}`,
  };

  const footerTextStyles = {
    fontSize: typography.fontSize.xs,
    color: colors.secondary.slate,
    marginBottom: spacing.sm,
  };

  const footerLinksStyles = {
    fontSize: typography.fontSize.xs,
    color: colors.secondary.mediumGray,
  };

  return (
    <div style={containerStyles}>
      <div style={formContainerStyles}>
        <Card variant="default" hover={false} padding="1.5rem">
          <div style={headerStyles}>
            <div style={logoContainerStyles}>
              <div style={{
                fontSize: '1.5rem',
                marginBottom: spacing.xs,
                color: colors.primary.herbalGreen,
              }}>🕉️</div>
              <h1 style={titleStyles}>AyurAhaar</h1>
            </div>
              <p style={subtitleStyles}>Healthcare Professional Access</p>
              <p style={descriptionStyles}>
                Secure portal for Ayurvedic practitioners to manage patient care and treatment plans
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Input
                label="Email / Mobile Number"
                type="email"
                placeholder="Enter your email or mobile number"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                floating={true}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                showPasswordToggle={true}
                floating={true}
              />

              <div style={forgotPasswordStyles}>
                <a href="#" style={linkStyles}>
                  Forgot Password?
                </a>
              </div>

              <div style={{ marginTop: spacing.lg }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="medium"
                  fullWidth
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Login'}
                </Button>
              </div>
            </form>

            <div style={dividerStyles}>
              <div style={dividerLineStyles}></div>
              <span style={dividerTextStyles}>or continue with</span>
              <div style={dividerLineStyles}></div>
            </div>

            <div>
              <Button
                variant="google"
                size="medium"
                fullWidth
                onClick={handleGoogleSignIn}
              >
                Sign in with Google
              </Button>
            </div>

            <div style={footerStyles}>
              <p style={footerTextStyles}>
                For certified Ayurvedic practitioners and healthcare professionals<br />
                Need assistance? <a href="#" style={linkStyles}>Contact medical support</a>
              </p>
              <div style={footerLinksStyles}>
                <a href="#" style={{ ...linkStyles, fontSize: typography.fontSize.xs }}>
                  Medical Privacy Policy
                </a>
                {' • '}
                <a href="#" style={{ ...linkStyles, fontSize: typography.fontSize.xs }}>
                  Professional Terms
                </a>
              </div>
            </div>
          </Card>
        </div>
    </div>
  );
};

export default LoginScreen;
