import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Card
} from '../../components';

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
    maxWidth: '420px',
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

  const forgotPasswordStyles = {
    textAlign: 'right',
    marginBottom: '1.5rem',
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

  const dividerStyles = {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
    color: 'var(--medical-gray-500)',
    fontSize: '0.875rem',
    fontWeight: '500',
  };

  const dividerLineStyles = {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, var(--medical-gray-300), transparent)',
  };

  const dividerTextStyles = {
    padding: '0 1rem',
    backgroundColor: 'var(--medical-white)',
    color: 'var(--medical-gray-600)',
    fontWeight: '500',
    fontSize: '0.875rem',
  };

  const footerStyles = {
    textAlign: 'center',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--medical-gray-200)',
  };

  const footerTextStyles = {
    fontSize: '0.875rem',
    color: 'var(--medical-gray-600)',
    marginBottom: '1rem',
    lineHeight: '1.5',
  };

  const footerLinksStyles = {
    fontSize: '0.875rem',
    color: 'var(--medical-gray-500)',
  };

  const medicalIconStyles = {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, var(--medical-white), rgba(255, 255, 255, 0.9))',
    borderRadius: '50%',
    width: '4rem',
    height: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--medical-shadow-md)',
  };

  return (
    <div style={containerStyles}>
      <div style={backgroundPatternStyles} />
      
      <div style={formContainerStyles}>
        <Card medical={true} padding="large" hover={false}>
          <div style={headerStyles}>
            <div style={logoContainerStyles}>
              <div style={medicalIconStyles}>
                🕉️
              </div>
              <h1 style={titleStyles}>AyurAhaar</h1>
            </div>
            <p style={subtitleStyles}>Healthcare Professional Portal</p>
            <p style={descriptionStyles}>
              Secure access for certified Ayurvedic practitioners to manage patient care, treatment plans, and medical consultations
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email Address / Mobile Number"
              type="email"
              placeholder="Enter your professional email or mobile"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              required={true}
              size="medium"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              }
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your secure password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={errors.password}
              showPasswordToggle={true}
              required={true}
              size="medium"
              helperText="Minimum 6 characters required"
            />

            <div style={forgotPasswordStyles}>
              <a 
                href="#" 
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
                Forgot Password?
              </a>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
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
              variant="secondary"
              size="large"
              fullWidth
              onClick={handleGoogleSignIn}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
            >
              Sign in with Google
            </Button>
          </div>

          <div style={footerStyles}>
            <p style={footerTextStyles}>
              This portal is exclusively for certified Ayurvedic practitioners and licensed healthcare professionals.<br />
              Need technical assistance? <a 
                href="#" 
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
                Contact Medical IT Support
              </a>
            </p>
            <div style={footerLinksStyles}>
              <a 
                href="#" 
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--medical-gray-100)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                HIPAA Privacy Policy
              </a>
              {' • '}
              <a 
                href="#" 
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--medical-gray-100)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Professional Terms of Service
              </a>
              {' • '}
              <a 
                href="#" 
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--medical-gray-100)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Medical Ethics Guidelines
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
