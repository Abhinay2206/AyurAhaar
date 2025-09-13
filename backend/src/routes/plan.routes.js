const express = require('express');
const router = express.Router();
const {
  getCurrentPlan,
  setAIPlan
} = require('../controllers/plan.controller');

// Get current plan for patient with display rules
router.get('/patient/:patientId', getCurrentPlan);

// Set AI plan for patient
router.post('/patient/:patientId/ai', setAIPlan);

module.exports = router;