import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components';
import './SuperAdminLogin.css';

const SuperAdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, any credentials work
    if (credentials.email && credentials.password) {
      localStorage.setItem('userRole', 'super-admin');
      navigate('/super-admin/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="super-admin-login">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <div className="logo">
              <span className="logo-icon">🏛️</span>
              <h1>AyurAhaar</h1>
              <p>Super Admin Portal</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <Input
              type="email"
              label="Admin Email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
              placeholder="admin@ayurahaar.com"
              required
            />
            
            <Input
              type="password"
              label="Password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
              placeholder="Enter your password"
              required
            />

            <Button 
              type="submit" 
              variant="primary" 
              isLoading={isLoading}
              className="login-button"
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Portal'}
            </Button>
          </form>

          <div className="login-footer">
            <p>Authorized access only</p>
            <button 
              type="button"
              className="back-link"
              onClick={() => navigate('/login')}
            >
              ← Back to Doctor Portal
            </button>
          </div>
        </Card>

        <div className="admin-features">
          <h2>Super Admin Capabilities</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">👨‍⚕️</span>
              <h3>Doctor Management</h3>
              <p>Approve, manage, and monitor all registered doctors</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <h3>Patient Oversight</h3>
              <p>View patient analytics and system-wide health trends</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🥗</span>
              <h3>Food Database</h3>
              <p>Manage Ayurvedic food items and nutritional data</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <h3>System Analytics</h3>
              <p>Monitor platform performance and user engagement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
