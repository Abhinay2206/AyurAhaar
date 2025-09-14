const express = require('express');
const router = express.Router();
const {
  getCurrentPlan,
  setAIPlan,
  generateAIPlan,
  resetPlan
} = require('../controllers/plan.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get current plan for patient with display rules
router.get('/patient/:patientId', getCurrentPlan);

// Set AI plan for patient
router.post('/patient/:patientId/ai', setAIPlan);

// Generate AI plan using AI server
router.post('/generate-ai-plan', authenticateToken, generateAIPlan);

// Reset plan for patient
router.post('/patient/:patientId/reset', authenticateToken, resetPlan);

module.exports = router;