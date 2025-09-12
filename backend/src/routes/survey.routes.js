const express = require('express');
const { submitSurvey, getSurveyStatus } = require('../controllers/survey.controller');
const { authenticateToken, requirePatientRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requirePatientRole);

// Submit survey data
router.post('/submit', submitSurvey);

// Get survey status and data
router.get('/status', getSurveyStatus);

module.exports = router;
