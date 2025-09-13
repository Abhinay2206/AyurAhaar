const express = require('express');
const router = express.Router();
const {
  getPrakritiQuestions,
  startPrakritiAssessment,
  submitPrakritiAnswer,
  getAssessmentProgress,
  getPrakritiHistory,
  getCurrentPrakriti
} = require('../controllers/prakriti.controller');
const { authenticateToken, requirePatientRole } = require('../middleware/auth.middleware');

// All routes require authentication and patient role
router.use(authenticateToken);
router.use(requirePatientRole);

// Get all Prakriti assessment questions
router.get('/questions', getPrakritiQuestions);

// Start a new Prakriti assessment
router.post('/start', startPrakritiAssessment);

// Submit answer to a specific question
router.post('/submit-answer', submitPrakritiAnswer);

// Get assessment progress
router.get('/progress/:assessmentId', getAssessmentProgress);

// Get patient's Prakriti history
router.get('/history', getPrakritiHistory);

// Get current Prakriti status
router.get('/current', getCurrentPrakriti);

module.exports = router;