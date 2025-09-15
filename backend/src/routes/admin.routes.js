const express = require('express');
const { getAllPatients, getPatientById } = require('../controllers/patient.controller');
const { getAllAppointments } = require('../controllers/appointment.controller');
const { getPatientSurveyData } = require('../controllers/survey.controller');
const { getPatientPrakritiData } = require('../controllers/prakriti.controller');
const { authenticateToken, requireAdminRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireAdminRole);

// Get all patients for admin/doctor management
router.get('/patients', getAllPatients);

// Get specific patient by ID for admin/doctor management
router.get('/patients/:patientId', getPatientById);

// Get all appointments for admin/doctor management
router.get('/appointments', getAllAppointments);

// Get patient survey data
router.get('/patients/:patientId/survey', getPatientSurveyData);

// Get patient prakriti assessment data
router.get('/patients/:patientId/prakriti', getPatientPrakritiData);

module.exports = router;