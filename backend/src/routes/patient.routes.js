const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  getDashboard, 
  updateSurveyStatus, 
  updatePlan 
} = require('../controllers/patient.controller');
const { authenticateToken, requirePatientRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requirePatientRole);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Dashboard route
router.get('/dashboard', getDashboard);

// Survey status route
router.put('/survey-status', updateSurveyStatus);

// Plan management route
router.put('/plan', updatePlan);

module.exports = router;