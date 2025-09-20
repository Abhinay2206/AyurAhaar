const Doctor = require('../models/Doctor');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Get all settings for the authenticated doctor
const getSettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await Doctor.findById(doctorId).select('-password');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Construct complete settings object
    const settings = {
      profile: {
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        experience: doctor.experience || '',
        qualification: doctor.qualification || '',
        clinic: doctor.clinic || ''
      },
      notifications: doctor.notificationSettings || {
        emailNotifications: true,
        smsNotifications: false,
        appointmentReminders: true,
        newPatientAlerts: true,
        treatmentUpdates: false,
        systemUpdates: true
      },
      preferences: doctor.preferences || {
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
        twoFactorEnabled: doctor.twoFactorEnabled || false,
        lastPasswordChange: doctor.lastPasswordChange || doctor.createdAt,
        loginAttempts: doctor.loginAttempts || 0,
        sessionTimeout: doctor.sessionTimeout || 30
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
      error: error.message
    });
  }
};

// Update all settings
const updateSettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { profile, notifications, preferences, security } = req.body;

    const updateData = {};

    // Update profile data
    if (profile) {
      if (profile.name) updateData.name = profile.name;
      if (profile.email) updateData.email = profile.email;
      if (profile.phone) updateData.phone = profile.phone;
      if (profile.specialization) updateData.specialization = profile.specialization;
      if (profile.experience) updateData.experience = profile.experience;
      if (profile.qualification) updateData.qualification = profile.qualification;
      if (profile.clinic) updateData.clinic = profile.clinic;
    }

    // Update notification settings
    if (notifications) {
      updateData.notificationSettings = notifications;
    }

    // Update preferences
    if (preferences) {
      updateData.preferences = preferences;
    }

    // Update security settings (excluding sensitive fields)
    if (security) {
      if (security.sessionTimeout) updateData.sessionTimeout = security.sessionTimeout;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// Get profile settings
const getProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await Doctor.findById(doctorId).select('name email phone specialization experience qualification clinic');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: {
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        experience: doctor.experience || '',
        qualification: doctor.qualification || '',
        clinic: doctor.clinic || ''
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update profile settings
const updateProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { name, email, phone, specialization, experience, qualification, clinic } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (specialization) updateData.specialization = specialization;
    if (experience) updateData.experience = experience;
    if (qualification) updateData.qualification = qualification;
    if (clinic) updateData.clinic = clinic;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true, runValidators: true }
    ).select('name email phone specialization experience qualification clinic');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get notification settings
const getNotificationSettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await Doctor.findById(doctorId).select('notificationSettings');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const defaultNotifications = {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      newPatientAlerts: true,
      treatmentUpdates: false,
      systemUpdates: true
    };

    res.json({
      success: true,
      data: doctor.notificationSettings || defaultNotifications
    });
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification settings',
      error: error.message
    });
  }
};

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const notificationSettings = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { notificationSettings },
      { new: true, runValidators: true }
    ).select('notificationSettings');

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: updatedDoctor.notificationSettings
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
      error: error.message
    });
  }
};

// Get preferences
const getPreferences = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await Doctor.findById(doctorId).select('preferences');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const defaultPreferences = {
      language: 'english',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR',
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      consultationDuration: 30
    };

    res.json({
      success: true,
      data: doctor.preferences || defaultPreferences
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: error.message
    });
  }
};

// Update preferences
const updatePreferences = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const preferences = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { preferences },
      { new: true, runValidators: true }
    ).select('preferences');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedDoctor.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

// Get security settings
const getSecuritySettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await Doctor.findById(doctorId).select('twoFactorEnabled lastPasswordChange loginAttempts sessionTimeout createdAt');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: {
        twoFactorEnabled: doctor.twoFactorEnabled || false,
        lastPasswordChange: doctor.lastPasswordChange || doctor.createdAt,
        loginAttempts: doctor.loginAttempts || 0,
        sessionTimeout: doctor.sessionTimeout || 30
      }
    });
  } catch (error) {
    console.error('Error getting security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security settings',
      error: error.message
    });
  }
};

// Update security settings
const updateSecuritySettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { sessionTimeout } = req.body;

    const updateData = {};
    if (sessionTimeout) updateData.sessionTimeout = sessionTimeout;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updateData,
      { new: true, runValidators: true }
    ).select('twoFactorEnabled lastPasswordChange loginAttempts sessionTimeout');

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: {
        twoFactorEnabled: updatedDoctor.twoFactorEnabled || false,
        lastPasswordChange: updatedDoctor.lastPasswordChange,
        loginAttempts: updatedDoctor.loginAttempts || 0,
        sessionTimeout: updatedDoctor.sessionTimeout || 30
      }
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security settings',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, doctor.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and last password change date
    await Doctor.findByIdAndUpdate(doctorId, {
      password: hashedNewPassword,
      lastPasswordChange: new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Enable two-factor authentication
const enableTwoFactor = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Generate secret for 2FA
    const secret = speakeasy.generateSecret({
      name: `AyurAhaar - ${doctor.email}`,
      issuer: 'AyurAhaar'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save the secret temporarily (should be confirmed before final save)
    await Doctor.findByIdAndUpdate(doctorId, {
      tempTwoFactorSecret: secret.base32
    });

    res.json({
      success: true,
      message: '2FA setup initiated',
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      }
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA',
      error: error.message
    });
  }
};

// Disable two-factor authentication
const disableTwoFactor = async (req, res) => {
  try {
    const doctorId = req.user.id;

    await Doctor.findByIdAndUpdate(doctorId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      tempTwoFactorSecret: null
    });

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
      error: error.message
    });
  }
};

// Get doctor availability settings
const getAvailabilitySettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const doctor = await Doctor.findById(doctorId).select('availability isOnline');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const availabilitySettings = {
      isOnline: doctor.isOnline || false,
      availability: doctor.availability || {
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
    };

    res.json({
      success: true,
      data: availabilitySettings
    });
  } catch (error) {
    console.error('Error fetching availability settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability settings'
    });
  }
};

// Update doctor availability settings
const updateAvailabilitySettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { availability } = req.body;

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'Availability data is required'
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: { availability } },
      { new: true, runValidators: true }
    ).select('availability');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability settings updated successfully',
      data: { availability: doctor.availability }
    });
  } catch (error) {
    console.error('Error updating availability settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating availability settings'
    });
  }
};

// Update doctor online/offline status
const updateOnlineStatus = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { isOnline } = req.body;

    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isOnline must be a boolean value'
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { 
        $set: { 
          isOnline,
          lastStatusUpdate: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('isOnline lastStatusUpdate');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: `Doctor status updated to ${isOnline ? 'online' : 'offline'}`,
      data: { 
        isOnline: doctor.isOnline,
        lastStatusUpdate: doctor.lastStatusUpdate
      }
    });
  } catch (error) {
    console.error('Error updating online status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating online status'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  getNotificationSettings,
  updateNotificationSettings,
  getPreferences,
  updatePreferences,
  getSecuritySettings,
  updateSecuritySettings,
  changePassword,
  enableTwoFactor,
  disableTwoFactor,
  getAvailabilitySettings,
  updateAvailabilitySettings,
  updateOnlineStatus
};