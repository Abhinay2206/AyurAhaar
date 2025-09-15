import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Professional Medical Header */}
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <div className="brand-logo">
              🌿
            </div>
            <span>AyurAhaar</span>
          </Link>
          <nav className="navbar-nav">
            <Link to="/auth" className="nav-link">Login</Link>
            <Link to="/auth" className="btn btn-primary">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Transform Your Health with Ancient Ayurvedic Wisdom
          </h1>
          <p className="hero-subtitle">
            Experience personalized Ayurvedic nutrition plans designed by certified doctors 
            to restore balance, vitality, and wellness in your life.
          </p>
          <div className="hero-actions">
            <Link to="/auth" className="btn btn-primary btn-lg">
              Consult with Ayurvedic Doctors
            </Link>
            <Link to="/ayurveda-info" className="btn btn-outline btn-lg">
              Learn About Ayurveda
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="text-center mb-5">
            <h2>Comprehensive Ayurvedic Healthcare Platform</h2>
            <p className="lead">
              Experience the perfect blend of traditional Ayurvedic wisdom and modern healthcare technology
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                👩‍⚕️
              </div>
              <h3>Certified Ayurvedic Doctors</h3>
              <p>
                Consult with verified Ayurvedic practitioners who specialize in 
                personalized nutrition and holistic wellness approaches.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                🔬
              </div>
              <h3>AI-Powered Analysis</h3>
              <p>
                Advanced AI technology analyzes your constitution (Prakriti) and 
                current health status to provide precise recommendations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                🥗
              </div>
              <h3>Personalized Meal Plans</h3>
              <p>
                Receive customized nutrition plans based on your unique body constitution, 
                seasonal needs, and health goals.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                📊
              </div>
              <h3>Progress Tracking</h3>
              <p>
                Monitor your wellness journey with detailed analytics and 
                regular assessments from your Ayurvedic healthcare team.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                🌱
              </div>
              <h3>Natural Remedies</h3>
              <p>
                Access a comprehensive database of natural Ayurvedic remedies 
                and lifestyle recommendations for optimal health.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                📱
              </div>
              <h3>Mobile Accessibility</h3>
              <p>
                Take your wellness journey anywhere with our responsive platform 
                designed for seamless mobile experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2>Your Journey to Wellness in 4 Simple Steps</h2>
            <p className="lead">Start your personalized Ayurvedic transformation today</p>
          </div>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Complete Assessment</h4>
              <p>Fill out our comprehensive health questionnaire to determine your unique body constitution and current wellness state.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Doctor Consultation</h4>
              <p>Meet with a certified Ayurvedic doctor for personalized analysis and detailed health evaluation.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Receive Your Plan</h4>
              <p>Get your customized nutrition plan, lifestyle recommendations, and natural remedy suggestions.</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Track Progress</h4>
              <p>Monitor your wellness journey with regular check-ins and plan adjustments based on your progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2>What Our Patients Say</h2>
            <p className="lead">Real stories from people who transformed their health with AyurAhaar</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>
                  "AyurAhaar completely transformed my relationship with food and health. 
                  The personalized meal plans based on my Prakriti helped me lose weight naturally 
                  and feel more energetic than ever before."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">P</div>
                <div className="author-info">
                  <h5>Priya Sharma</h5>
                  <span>Software Engineer, Mumbai</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>
                  "The doctors on AyurAhaar are incredibly knowledgeable. 
                  Their holistic approach helped me manage my digestive issues 
                  without any side effects. Highly recommended!"
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">R</div>
                <div className="author-info">
                  <h5>Raj Patel</h5>
                  <span>Business Owner, Delhi</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>
                  "As a working mother, I needed a practical wellness solution. 
                  AyurAhaar's meal plans fit perfectly into my busy lifestyle 
                  and improved my family's overall health."
                </p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">S</div>
                <div className="author-info">
                  <h5>Sneha Gupta</h5>
                  <span>Marketing Manager, Bangalore</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Ayurvedic Wellness Journey?</h2>
            <p>
              Join thousands of people who have transformed their health with personalized 
              Ayurvedic nutrition and lifestyle guidance from certified doctors.
            </p>
            <div className="cta-actions">
              <Link to="/auth" className="btn btn-primary btn-lg">
                Book Your Consultation
              </Link>
              <Link to="/ayurveda-info" className="btn btn-outline btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="medical-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h5>AyurAhaar</h5>
              <p>
                Bridging ancient Ayurvedic wisdom with modern healthcare technology 
                for personalized wellness solutions.
              </p>
            </div>
            
            <div className="footer-section">
              <h6>Services</h6>
              <ul>
                <li><Link to="/doctors">Find Doctors</Link></li>
                <li><Link to="/ayurveda-info">Ayurveda Info</Link></li>
                <li><Link to="/body-constitution">Constitution Analysis</Link></li>
                <li><Link to="/chatbot">AI Assistant</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h6>Support</h6>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h6>Connect</h6>
              <div className="social-links">
                <a href="#facebook" className="social-link">Facebook</a>
                <a href="#twitter" className="social-link">Twitter</a>
                <a href="#instagram" className="social-link">Instagram</a>
                <a href="#linkedin" className="social-link">LinkedIn</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 AyurAhaar. All rights reserved. | Certified Ayurvedic Healthcare Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;