import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Button, 
  Input, 
  Card
} from '../../components';
import { AuthService } from '../../services';

const LoginScreen = () => {
  const navigate = useNavigate();
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
        [field]: '',
        general: '' // Also clear general error when user starts typing
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email or mobile number is required';
    } else if (formData.email.includes('@') && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.includes('@') && !/^\d{10}$/.test(formData.email.trim())) {
      // If it doesn't contain @ and is not a 10-digit number, it's invalid
      newErrors.email = 'Please enter a valid email address or 10-digit mobile number';
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
    setErrors({}); // Clear any previous errors
    
    try {
      const result = await AuthService.login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        // Redirect to appropriate dashboard based on user role
        navigate(result.redirectTo, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.message || 'Login failed. Please check your credentials and try again.'
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
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #3E8E5A 0%, #2C5F41 50%, #1a3d2e 100%)',
    padding: '1rem',
    position: 'relative',
  };

  const backgroundPatternStyles = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(244, 162, 97, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 80%, rgba(62, 142, 90, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)
    `,
    zIndex: 0,
  };

  const formContainerStyles = {
    width: '100%',
    maxWidth: '440px',
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
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #3E8E5A, #2C5F41)',
    borderRadius: '16px',
    color: '#ffffff',
    boxShadow: '0 10px 25px rgba(44, 95, 65, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '0.5rem',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '-0.025em',
  };

  const subtitleStyles = {
    fontSize: '1.125rem',
    color: '#2C5F41',
    fontWeight: '600',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginBottom: '0.75rem',
  };

  const descriptionStyles = {
    fontSize: '0.875rem',
    color: '#687076',
    fontWeight: '400',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: '1.6',
    textAlign: 'center',
    maxWidth: '360px',
    margin: '0 auto',
  };

  const forgotPasswordStyles = {
    textAlign: 'right',
    marginBottom: '1.5rem',
  };

  const linkStyles = {
    color: '#3E8E5A',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    borderRadius: '6px',
    padding: '0.375rem 0.75rem',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const footerStyles = {
    textAlign: 'center',
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
  };

  const footerTextStyles = {
    fontSize: '0.875rem',
    color: '#687076',
    marginBottom: '1rem',
    lineHeight: '1.6',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const footerLinksStyles = {
    fontSize: '0.875rem',
    color: '#9ca3af',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  return (
    <div style={containerStyles}>
      <div style={backgroundPatternStyles} />
      
      <div style={formContainerStyles}>
        <Card 
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(44, 95, 65, 0.15), 0 10px 25px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '2.5rem'
          }}
        >
          <div style={headerStyles}>
            <div style={logoContainerStyles}>
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
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
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
                  e.target.style.backgroundColor = '#3E8E5A';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#3E8E5A';
                }}
              >
                Forgot Password?
              </a>
            </div>

            {errors.general && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.875rem',
                fontWeight: '500',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                {errors.general}
              </div>
            )}

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

          <div style={footerStyles}>
            <p style={footerTextStyles}>
              New to AyurAhaar?{' '}
              <Link 
                to="/register" 
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3E8E5A';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#3E8E5A';
                }}
              >
                Register as Doctor
              </Link>
            </p>
            <p style={footerTextStyles}>
              This portal is exclusively for certified Ayurvedic practitioners and licensed healthcare professionals.<br />
              Need technical assistance? <a 
                href="#" 
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#3E8E5A';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#3E8E5A';
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
                  e.target.style.backgroundColor = '#f3f4f6';
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
                  e.target.style.backgroundColor = '#f3f4f6';
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
                  e.target.style.backgroundColor = '#f3f4f6';
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
