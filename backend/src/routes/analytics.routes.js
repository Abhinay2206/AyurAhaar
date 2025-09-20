const express = require('express');
const router = express.Router();
const { authenticateToken, requireDoctorRole, requireAdminRole } = require('../middleware/auth.middleware');
const {
  getAnalytics,
  getPatientAnalytics,
  getConsultationAnalytics,
  getTreatmentAnalytics,
  getRevenueAnalytics,
  exportAnalyticsReport
} = require('../controllers/analytics.controller');

// All analytics routes require authentication and doctor role
router.use(authenticateToken);

// Doctor analytics routes
router.get('/', requireDoctorRole, getAnalytics);
router.get('/patients', requireDoctorRole, getPatientAnalytics);
router.get('/consultations', requireDoctorRole, getConsultationAnalytics);
router.get('/treatments', requireDoctorRole, getTreatmentAnalytics);
router.get('/revenue', requireDoctorRole, getRevenueAnalytics);
router.get('/export', requireDoctorRole, exportAnalyticsReport);

// Admin routes for viewing analytics across all doctors
router.get('/admin/overview', requireAdminRole, getAnalytics);
router.get('/admin/patients', requireAdminRole, getPatientAnalytics);
router.get('/admin/consultations', requireAdminRole, getConsultationAnalytics);
router.get('/admin/treatments', requireAdminRole, getTreatmentAnalytics);
router.get('/admin/revenue', requireAdminRole, getRevenueAnalytics);
router.get('/admin/export', requireAdminRole, exportAnalyticsReport);

module.exports = router;