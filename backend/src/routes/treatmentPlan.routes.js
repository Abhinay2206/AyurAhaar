const express = require('express');
const router = express.Router();
const {
  getAllTreatmentPlans,
  getTreatmentPlanById,
  getPatientTreatmentPlans,
  createTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  getPatientsWithConsultations,
  approveTreatmentPlan,
  startConsultation,
  completeConsultation
} = require('../controllers/treatmentPlan.controller');
const { authenticateToken, requireAdminRole, requireDoctorRole } = require('../middleware/auth.middleware');

// Protect all routes with authentication
router.use(authenticateToken);

// Get all treatment plans (admin/doctor access)
router.get('/', requireAdminRole, getAllTreatmentPlans);

// Get patients with consultations (admin/doctor access)
router.get('/patients', requireAdminRole, getPatientsWithConsultations);

// Get treatment plan by ID
router.get('/:id', getTreatmentPlanById);

// Get treatment plans for specific patient
router.get('/patient/:patientId', getPatientTreatmentPlans);

// Create new treatment plan (doctor/admin access)
router.post('/', requireAdminRole, createTreatmentPlan);

// Update treatment plan (doctor/admin access)
router.put('/:id', requireAdminRole, updateTreatmentPlan);

// Approve treatment plan (doctor/admin access)
router.put('/:id/approve', requireAdminRole, approveTreatmentPlan);

// Consultation management
router.post('/consultation/:patientId/start', requireAdminRole, startConsultation);
router.put('/consultation/:patientId/complete', requireAdminRole, completeConsultation);

// Delete treatment plan (admin access only)
router.delete('/:id', requireAdminRole, deleteTreatmentPlan);

module.exports = router;