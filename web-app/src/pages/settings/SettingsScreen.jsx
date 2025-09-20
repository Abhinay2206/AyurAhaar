import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Button, Input } from '../../components';
import ApiService from '../../services/api';

const SettingsScreen = () => {
  const location = useLocation();
  const [settings, setSettings] = useState({});
  const [availabilitySettings, setAvailabilitySettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [settingsResponse, availabilityResponse] = await Promise.all([
        ApiService.getSettings(),
        ApiService.getAvailabilitySettings()
      ]);
      
      const settingsData = settingsResponse.data || settingsResponse;
      const availabilityData = availabilityResponse.data || availabilityResponse;
      
      setSettings(settingsData);
      setAvailabilitySettings(availabilityData);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Using demo data.');
      
      // Fallback to mock data
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
      
      // Fallback availability data
      setAvailabilitySettings({
        isOnline: false,
        availability: {
          workingDays: {
            monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
            saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
            sunday: { enabled: false, startTime: '09:00', endTime: '17:00' }
          },
          timezone: 'Asia/Kolkata',
          consultationDuration: 30,
          breakTime: {
            enabled: true,
            startTime: '13:00',
            endTime: '14:00'
          },
          maxAppointmentsPerDay: 20,
          advanceBookingDays: 30,
          lastMinuteBooking: {
            enabled: true,
            minimumHours: 1
          }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleOnlineStatus = async (newStatus) => {
    try {
      await ApiService.updateOnlineStatus(newStatus);
      setAvailabilitySettings(prev => ({
        ...prev,
        isOnline: newStatus
      }));
    } catch (error) {
      console.error('Error updating online status:', error);
      alert('Failed to update online status. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      await ApiService.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;
    
    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    try {
      await ApiService.changePassword({
        currentPassword,
        newPassword
      });
      alert('Password changed successfully!');
      
      // Update last password change date
      setSettings(prev => ({
        ...prev,
        security: {
          ...prev.security,
          lastPasswordChange: new Date().toISOString().split('T')[0]
        }
      }));
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Failed to change password. Please try again.');
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      if (settings.security?.twoFactorEnabled) {
        if (confirm('Are you sure you want to disable two-factor authentication?')) {
          await ApiService.disableTwoFactor();
          setSettings(prev => ({
            ...prev,
            security: {
              ...prev.security,
              twoFactorEnabled: false
            }
          }));
          alert('Two-factor authentication disabled');
        }
      } else {
        const response = await ApiService.enableTwoFactor();
        const qrCode = response.data.qrCode;
        
        // Show QR code in a simple way (in a real app, you'd want a proper modal)
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head><title>Enable 2FA - AyurAhaar</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
              <h2>Enable Two-Factor Authentication</h2>
              <p>Scan this QR code with your authenticator app:</p>
              <img src="${qrCode}" alt="2FA QR Code" style="max-width: 300px;" />
              <p>Manual entry key: ${response.data.secret}</p>
              <p>Close this window when you've set up 2FA in your app.</p>
            </body>
          </html>
        `);
        
        alert('Two-factor authentication setup initiated. Please scan the QR code with your authenticator app.');
        setSettings(prev => ({
          ...prev,
          security: {
            ...prev.security,
            twoFactorEnabled: true
          }
        }));
      }
    } catch (err) {
      console.error('Error toggling 2FA:', err);
      alert('Failed to toggle two-factor authentication. Please try again.');
    }
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
          value={settings.profile?.name || ''}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, name: e.target.value }
          })}
        />
        <Input
          label="Email"
          type="email"
          value={settings.profile?.email || ''}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, email: e.target.value }
          })}
        />
        <Input
          label="Phone"
          value={settings.profile?.phone || ''}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, phone: e.target.value }
          })}
        />
        <Input
          label="Specialization"
          value={settings.profile?.specialization || ''}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, specialization: e.target.value }
          })}
        />
        <Input
          label="Experience"
          value={settings.profile?.experience || ''}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, experience: e.target.value }
          })}
        />
        <Input
          label="Qualification"
          value={settings.profile?.qualification || ''}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, qualification: e.target.value }
          })}
        />
        <Input
          label="Clinic"
          value={settings.profile?.clinic || ''}
          onChange={(e) => setSettings({
            ...settings,
            profile: { ...settings.profile, clinic: e.target.value }
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
        {Object.entries(settings.notifications || {}).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
            <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '500' }}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="checkbox"
              checked={value || false}
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
        Preferences
      </h3>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '500' }}>
            Language
          </label>
          <select 
            value={settings.preferences?.language || 'en'}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, language: e.target.value }
            })}
            style={{ 
              padding: '0.5rem', 
              border: '1px solid #D1D5DB', 
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#2C5F41'
            }}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="sa">Sanskrit</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '500' }}>
            Time Zone
          </label>
          <select 
            value={settings.preferences?.timezone || 'Asia/Kolkata'}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, timezone: e.target.value }
            })}
            style={{ 
              padding: '0.5rem', 
              border: '1px solid #D1D5DB', 
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              color: '#2C5F41'
            }}
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '500' }}>
            Dark Mode
          </label>
          <input
            type="checkbox"
            checked={settings.preferences?.darkMode || false}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, darkMode: e.target.checked }
            })}
            style={{ width: '18px', height: '18px', accentColor: '#3E8E5A' }}
          />
        </div>
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
          <Button 
            variant={settings.security?.twoFactorEnabled ? 'success' : 'outline'} 
            size="small"
            onClick={handleToggleTwoFactor}
          >
            {settings.security?.twoFactorEnabled ? 'Enabled' : 'Enable'}
          </Button>
        </div>
        
        <div style={{ padding: '0.75rem', backgroundColor: '#FDF4E8', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
            Last Password Change
          </div>
          <div style={{ fontSize: '0.75rem', color: '#687076' }}>
            {settings.security?.lastPasswordChange ? 
              new Date(settings.security.lastPasswordChange).toLocaleDateString() : 
              'Not available'
            }
          </div>
          <Button 
            variant="warning" 
            size="small" 
            style={{ marginTop: '0.5rem' }}
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </div>
        
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={settings.security?.sessionTimeout || 30}
          onChange={(e) => setSettings({
            ...settings,
            security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
          })}
        />
      </div>
    </Card>
  );

  const AvailabilitySettings = () => (
    <Card medical={true} padding="large">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1.5rem' }}>
        Availability Settings
      </h3>
      
      {/* Online Status */}
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41' }}>
              Current Status
            </div>
            <div style={{ fontSize: '0.75rem', color: '#687076' }}>
              Control your availability for new appointments
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: availabilitySettings.isOnline ? '#10B981' : '#EF4444'
            }} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41' }}>
              {availabilitySettings.isOnline ? 'Online' : 'Offline'}
            </span>
            <Button
              variant={availabilitySettings.isOnline ? 'secondary' : 'success'}
              size="small"
              onClick={() => handleToggleOnlineStatus(!availabilitySettings.isOnline)}
              style={{ marginLeft: '1rem' }}
            >
              {availabilitySettings.isOnline ? 'Go Offline' : 'Go Online'}
            </Button>
          </div>
        </div>
      </div>

      {/* Working Days */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1rem' }}>
          Working Days & Hours
        </h4>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {Object.entries(availabilitySettings.availability?.workingDays || {}).map(([day, schedule]) => (
            <div key={day} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.75rem',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              backgroundColor: schedule.enabled ? '#F0FDF4' : '#F9FAFB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => setAvailabilitySettings({
                    ...availabilitySettings,
                    availability: {
                      ...availabilitySettings.availability,
                      workingDays: {
                        ...availabilitySettings.availability.workingDays,
                        [day]: { ...schedule, enabled: e.target.checked }
                      }
                    }
                  })}
                  style={{ width: '16px', height: '16px', accentColor: '#3E8E5A' }}
                />
                <label style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#2C5F41',
                  textTransform: 'capitalize',
                  minWidth: '80px'
                }}>
                  {day}
                </label>
              </div>
              
              {schedule.enabled && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      availability: {
                        ...availabilitySettings.availability,
                        workingDays: {
                          ...availabilitySettings.availability.workingDays,
                          [day]: { ...schedule, startTime: e.target.value }
                        }
                      }
                    })}
                    style={{
                      padding: '0.375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}
                  />
                  <span style={{ color: '#687076' }}>to</span>
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => setAvailabilitySettings({
                      ...availabilitySettings,
                      availability: {
                        ...availabilitySettings.availability,
                        workingDays: {
                          ...availabilitySettings.availability.workingDays,
                          [day]: { ...schedule, endTime: e.target.value }
                        }
                      }
                    })}
                    style={{
                      padding: '0.375rem',
                      border: '1px solid #D1D5DB',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1rem' }}>
          Consultation Settings
        </h4>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '500' }}>
              Consultation Duration (minutes)
            </label>
            <input
              type="number"
              value={availabilitySettings.availability?.consultationDuration || 30}
              onChange={(e) => setAvailabilitySettings({
                ...availabilitySettings,
                availability: {
                  ...availabilitySettings.availability,
                  consultationDuration: parseInt(e.target.value)
                }
              })}
              min="15"
              max="120"
              step="15"
              style={{
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                width: '80px',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', color: '#2C5F41', fontWeight: '500' }}>
              Max Appointments Per Day
            </label>
            <input
              type="number"
              value={availabilitySettings.availability?.maxAppointmentsPerDay || 20}
              onChange={(e) => setAvailabilitySettings({
                ...availabilitySettings,
                availability: {
                  ...availabilitySettings.availability,
                  maxAppointmentsPerDay: parseInt(e.target.value)
                }
              })}
              min="1"
              max="50"
              style={{
                padding: '0.5rem',
                border: '1px solid #D1D5DB',
                borderRadius: '4px',
                width: '80px',
                textAlign: 'center'
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        variant="primary"
        onClick={async () => {
          try {
            setIsSaving(true);
            await ApiService.updateAvailabilitySettings({ availability: availabilitySettings.availability });
            alert('Availability settings saved successfully!');
          } catch (error) {
            console.error('Error saving availability settings:', error);
            alert('Failed to save availability settings. Please try again.');
          } finally {
            setIsSaving(false);
          }
        }}
        disabled={isSaving}
        style={{ width: '100%' }}
      >
        {isSaving ? 'Saving...' : 'Save Availability Settings'}
      </Button>
    </Card>
  );

  return (
    <div style={containerStyles}>
      {error && (
        <div style={{
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={headerStyles}>
        <h1 style={titleStyles}>Settings</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            variant="outline" 
            size="medium"
            onClick={fetchSettings}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </Button>
          <Button 
            variant="primary" 
            size="medium" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div style={tabStyles}>
        {['profile', 'notifications', 'preferences', 'security', 'availability'].map(tab => (
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
        {activeTab === 'availability' && <AvailabilitySettings />}
      </div>
    </div>
  );
};

export default SettingsScreen;