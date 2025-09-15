import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: "🏥",
      title: "Smart Patient Management",
      description: "Comprehensive patient profiles with AI-powered insights and treatment tracking"
    },
    {
      icon: "🍽️",
      title: "Intelligent Meal Planning",
      description: "Personalized Ayurvedic nutrition plans based on individual constitution and health goals"
    },
    {
      icon: "📱",
      title: "Mobile Patient App",
      description: "Seamless patient engagement with constitution assessment and progress tracking"
    },
    {
      icon: "🧠",
      title: "AI-Powered Insights",
      description: "Advanced analytics to optimize treatment outcomes and practice efficiency"
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <span className="icon-leaf">🌿</span>
              <div className="icon-glow"></div>
            </div>
            <div className="brand-text">
              <h1 className="brand-name">AyurAhaar</h1>
              <span className="brand-subtitle">Digital Ayurveda</span>
            </div>
          </Link>
          
          <div className="navbar-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#platform" className="nav-link">Platform</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/auth" className="btn btn-outline-primary">Sign In</Link>
            <Link to="/auth" className="btn btn-primary">
              Get Started
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>Next-Generation Ayurvedic Platform</span>
            </div>
            
            <h1 className="hero-title">
              Transform Your
              <span className="title-gradient"> Ayurvedic Practice</span>
              <br />with Modern Technology
            </h1>
            
            <p className="hero-description">
              Revolutionize patient care with our comprehensive digital platform. 
              Seamlessly manage patients, create personalized meal plans, and deliver 
              exceptional Ayurvedic healthcare with AI-powered insights.
            </p>
            
            <div className="hero-features">
              <div className="feature-point">
                <span className="check-icon">✓</span>
                <span>Complete Practice Management</span>
              </div>
              <div className="feature-point">
                <span className="check-icon">✓</span>
                <span>AI-Powered Meal Planning</span>
              </div>
              <div className="feature-point">
                <span className="check-icon">✓</span>
                <span>Patient Mobile App</span>
              </div>
            </div>
            
            <div className="hero-actions">
              <Link to="/auth" className="btn btn-primary btn-lg">
                <span>Start Free Trial</span>
                <span className="btn-arrow">→</span>
              </Link>
              <button className="btn btn-glass">
                <span className="play-icon">▶</span>
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="hero-social-proof">
              <div className="proof-item">
                <span className="proof-icon">🔒</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="proof-item">
                <span className="proof-icon">⚡</span>
                <span>Lightning Fast</span>
              </div>
              <div className="proof-item">
                <span className="proof-icon">🌱</span>
                <span>Eco-Friendly</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="dashboard-window">
                <div className="window-header">
                  <div className="window-controls">
                    <span className="control red"></span>
                    <span className="control yellow"></span>
                    <span className="control green"></span>
                  </div>
                  <div className="window-title">AyurAhaar Dashboard</div>
                </div>
                <div className="window-content">
                  <div className="dashboard-nav">
                    <div className="nav-item active">Dashboard</div>
                    <div className="nav-item">Patients</div>
                    <div className="nav-item">Meal Plans</div>
                    <div className="nav-item">Analytics</div>
                  </div>
                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-content">
                        <div className="stat-number">Patient</div>
                        <div className="stat-label">Management</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📊</div>
                      <div className="stat-content">
                        <div className="stat-number">Smart</div>
                        <div className="stat-label">Analytics</div>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-chart">
                    <div className="chart-header">Practice Overview</div>
                    <div className="chart-visualization">
                      <div className="chart-bars">
                        <div className="bar" style={{height: '70%'}}></div>
                        <div className="bar" style={{height: '85%'}}></div>
                        <div className="bar" style={{height: '60%'}}></div>
                        <div className="bar" style={{height: '95%'}}></div>
                        <div className="bar" style={{height: '75%'}}></div>
                        <div className="bar" style={{height: '88%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <span>🚀 Features</span>
            </div>
            <h2 className="section-title">
              Everything You Need for
              <span className="title-accent"> Modern Ayurvedic Practice</span>
            </h2>
            <p className="section-description">
              Our comprehensive platform combines traditional Ayurvedic wisdom with cutting-edge technology 
              to deliver exceptional patient care and streamline your practice operations.
            </p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-icon">
                  <span>{feature.icon}</span>
                  <div className="icon-bg"></div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section id="platform" className="platform">
        <div className="container">
          <div className="platform-content">
            <div className="platform-text">
              <div className="section-badge">
                <span>🏥 Complete Solution</span>
              </div>
              <h2 className="section-title">
                Comprehensive Platform for
                <span className="title-accent"> Ayurvedic Healthcare</span>
              </h2>
              <p className="section-description">
                From patient onboarding to treatment completion, our platform handles every aspect 
                of your practice with intuitive tools and intelligent automation.
              </p>
              
              <div className="platform-features">
                <div className="platform-feature">
                  <div className="feature-icon-sm">🔄</div>
                  <div>
                    <h4>Seamless Workflow</h4>
                    <p>Streamlined processes from consultation to follow-up</p>
                  </div>
                </div>
                <div className="platform-feature">
                  <div className="feature-icon-sm">🎯</div>
                  <div>
                    <h4>Personalized Care</h4>
                    <p>Tailored treatment plans based on individual constitution</p>
                  </div>
                </div>
                <div className="platform-feature">
                  <div className="feature-icon-sm">📈</div>
                  <div>
                    <h4>Practice Growth</h4>
                    <p>Analytics and insights to optimize your practice</p>
                  </div>
                </div>
              </div>
              
              <div className="platform-actions">
                <Link to="/auth" className="btn btn-primary">
                  Start Your Journey
                  <span className="btn-arrow">→</span>
                </Link>
                <button className="btn btn-outline">
                  Learn More
                </button>
              </div>
            </div>
            
            <div className="platform-visual">
              <div className="devices-showcase">
                <div className="device desktop">
                  <div className="device-screen">
                    <div className="screen-content">
                      <div className="app-header">Doctor Portal</div>
                      <div className="app-body">
                        <div className="sidebar">
                          <div className="sidebar-item active">Dashboard</div>
                          <div className="sidebar-item">Patients</div>
                          <div className="sidebar-item">Meal Plans</div>
                          <div className="sidebar-item">Reports</div>
                        </div>
                        <div className="main-content">
                          <div className="content-cards">
                            <div className="mini-card"></div>
                            <div className="mini-card"></div>
                            <div className="mini-card"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="device mobile">
                  <div className="device-screen">
                    <div className="mobile-header">
                      <div className="status-bar"></div>
                      <div className="app-title">AyurAhaar</div>
                    </div>
                    <div className="mobile-content">
                      <div className="mobile-card">Constitution</div>
                      <div className="mobile-card">Meal Plan</div>
                      <div className="mobile-card">Progress</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-bg">
          <div className="cta-gradient"></div>
          <div className="cta-pattern"></div>
        </div>
        
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2 className="cta-title">
                Ready to Transform Your Practice?
              </h2>
              <p className="cta-description">
                Join the future of Ayurvedic healthcare. Start your free trial today 
                and experience the power of modern technology in traditional medicine.
              </p>
              
              <div className="cta-benefits">
                <div className="benefit">
                  <span className="benefit-icon">✓</span>
                  <span>30-day free trial</span>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">✓</span>
                  <span>No credit card required</span>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">✓</span>
                  <span>24/7 support included</span>
                </div>
              </div>
            </div>
            
            <div className="cta-actions">
              <Link to="/auth" className="btn btn-primary btn-xl">
                Start Free Trial
                <span className="btn-arrow">→</span>
              </Link>
              <button className="btn btn-glass-white">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <div className="brand-icon">
                  <span className="icon-leaf">🌿</span>
                </div>
                <div className="brand-text">
                  <h3 className="brand-name">AyurAhaar</h3>
                  <span className="brand-subtitle">Digital Ayurveda Platform</span>
                </div>
              </Link>
              <p className="footer-description">
                Revolutionizing Ayurvedic healthcare with modern technology, 
                intelligent insights, and seamless patient care.
              </p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h4>Platform</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#platform">How it Works</a></li>
                  <li><Link to="/auth">Pricing</Link></li>
                  <li><Link to="/auth">API</Link></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4>Support</h4>
                <ul>
                  <li><a href="#contact">Help Center</a></li>
                  <li><a href="#contact">Contact Us</a></li>
                  <li><a href="#contact">Documentation</a></li>
                  <li><a href="#contact">Training</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h4>Company</h4>
                <ul>
                  <li><a href="#contact">About</a></li>
                  <li><a href="#contact">Blog</a></li>
                  <li><a href="#contact">Careers</a></li>
                  <li><a href="#contact">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-legal">
              <p>&copy; 2024 AyurAhaar. All rights reserved.</p>
              <div className="legal-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
              </div>
            </div>
            
            <div className="footer-security">
              <div className="security-badge">
                <span className="security-icon">🔒</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="security-badge">
                <span className="security-icon">🛡️</span>
                <span>SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;