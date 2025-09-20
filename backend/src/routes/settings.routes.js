const express = require('express');
const router = express.Router();
const { authenticateToken, requireDoctorRole } = require('../middleware/auth.middleware');
const {
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
} = require('../controllers/settings.controller');

// All settings routes require authentication and doctor role
router.use(authenticateToken);
router.use(requireDoctorRole);

// Main settings routes
router.get('/', getSettings);
router.put('/', updateSettings);

// Profile settings
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Notification settings
router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettings);

// Preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Security settings
router.get('/security', getSecuritySettings);
router.put('/security', updateSecuritySettings);
router.put('/security/password', changePassword);
router.post('/security/2fa/enable', enableTwoFactor);
router.post('/security/2fa/disable', disableTwoFactor);

// Availability settings
router.get('/availability', getAvailabilitySettings);
router.put('/availability', updateAvailabilitySettings);
router.put('/availability/status', updateOnlineStatus);

module.exports = router;