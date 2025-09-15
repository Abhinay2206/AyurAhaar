import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Mock settings data
    setTimeout(() => {
      setSettings({
        profile: {
          name: 'Dr. Sharma',
          email: 'dr.sharma@ayurahaar.com',
          phone: '+91 98765 43210',
          specialization: 'Ayurvedic Medicine',
          experience: '15 years',
          qualification: 'BAMS, MD (Ayurveda)',
          clinic: 'AyurAhaar Wellness Center'
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          appointmentReminders: true,
          newPatientAlerts: true,
          treatmentUpdates: false,
          systemUpdates: true
        },
        preferences: {
          language: 'english',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          currency: 'INR',
          workingHours: {
            start: '09:00',
            end: '18:00'
          },
          consultationDuration: 30
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2025-08-15',
          loginAttempts: 0,
          sessionTimeout: 30
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const containerStyles = {
    padding: '1.5rem',
    backgroundColor: '#F5F7FA',
    minHeight: '100vh'
  };

  const headerStyles = {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2C5F41',
    margin: 0
  };

  const tabStyles = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #E0E0E0',
    paddingBottom: '1rem'
  };

  const contentGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem'
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#687076' }}>Loading settings...</div>
        </div>
      </div>
    );
  }

  const ProfileSettings = () => (
    <Card medical={true} padding="large">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1.5rem' }}>
        Profile Information
      </h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <Input
          label="Full Name"
          value={settings.profile.name}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, name: e.target.value }
          })}
        />
        <Input
          label="Email"
          type="email"
          value={settings.profile.email}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, email: e.target.value }
          })}
        />
        <Input
          label="Phone"
          value={settings.profile.phone}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, phone: e.target.value }
          })}
        />
        <Input
          label="Specialization"
          value={settings.profile.specialization}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, specialization: e.target.value }
          })}
        />
        <Input
          label="Experience"
          value={settings.profile.experience}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, experience: e.target.value }
          })}
        />
      </div>
    </Card>
  );

  const NotificationSettings = () => (
    <Card medical={true} padding="large">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1.5rem' }}>
        Notification Preferences
      </h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
            <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '500' }}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, [key]: e.target.checked }
              })}
              style={{ width: '18px', height: '18px', accentColor: '#3E8E5A' }}
            />
          </div>
        ))}
      </div>
    </Card>
  );

  const PreferenceSettings = () => (
    <Card medical={true} padding="large">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1.5rem' }}>
        System Preferences
      </h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
            Language
          </label>
          <select
            value={settings.preferences.language}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, language: e.target.value }
            })}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: '0.875rem',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="sanskrit">Sanskrit</option>
          </select>
        </div>
        
        <Input
          label="Timezone"
          value={settings.preferences.timezone}
          onChange={(e) => setSettings({
            ...settings,
            preferences: { ...settings.preferences, timezone: e.target.value }
          })}
        />
        
        <Input
          label="Working Hours Start"
          type="time"
          value={settings.preferences.workingHours.start}
          onChange={(e) => setSettings({
            ...settings,
            preferences: { 
              ...settings.preferences, 
              workingHours: { ...settings.preferences.workingHours, start: e.target.value }
            }
          })}
        />
        
        <Input
          label="Default Consultation Duration (minutes)"
          type="number"
          value={settings.preferences.consultationDuration}
          onChange={(e) => setSettings({
            ...settings,
            preferences: { ...settings.preferences, consultationDuration: e.target.value }
          })}
        />
      </div>
    </Card>
  );

  const SecuritySettings = () => (
    <Card medical={true} padding="large">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1.5rem' }}>
        Security Settings
      </h3>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#E8F5E8', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41' }}>
              Two-Factor Authentication
            </div>
            <div style={{ fontSize: '0.75rem', color: '#687076' }}>
              Add an extra layer of security to your account
            </div>
          </div>
          <Button variant={settings.security.twoFactorEnabled ? 'success' : 'outline'} size="small">
            {settings.security.twoFactorEnabled ? 'Enabled' : 'Enable'}
          </Button>
        </div>
        
        <div style={{ padding: '0.75rem', backgroundColor: '#FDF4E8', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
            Last Password Change
          </div>
          <div style={{ fontSize: '0.75rem', color: '#687076' }}>
            {settings.security.lastPasswordChange}
          </div>
          <Button variant="warning" size="small" style={{ marginTop: '0.5rem' }}>
            Change Password
          </Button>
        </div>
        
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => setSettings({
            ...settings,
            security: { ...settings.security, sessionTimeout: e.target.value }
          })}
        />
      </div>
    </Card>
  );

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Settings</h1>
        <Button 
          variant="primary" 
          size="medium" 
          onClick={handleSave}
          loading={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div style={tabStyles}>
        {['profile', 'notifications', 'preferences', 'security'].map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'outline'}
            size="small"
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <div style={contentGridStyles}>
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'preferences' && <PreferenceSettings />}
        {activeTab === 'security' && <SecuritySettings />}
      </div>
    </div>
  );
};

export default SettingsScreen;