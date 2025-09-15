const express = require('express');
const router = express.Router();
const { authenticateToken, requireDoctorRole, requireAdminRole } = require('../middleware/auth.middleware');
const {
  getDashboardStats,
  getRecentActivities,
  searchDashboard,
  getNotifications
} = require('../controllers/dashboard.controller');

// All dashboard routes require authentication and doctor role
router.use(authenticateToken);

// Doctor dashboard routes
router.get('/stats', requireDoctorRole, getDashboardStats);
router.get('/recent-activities', requireDoctorRole, getRecentActivities);
router.get('/search', requireDoctorRole, searchDashboard);
router.get('/notifications', requireDoctorRole, getNotifications);

// Admin routes for viewing specific doctor dashboards
router.get('/doctor/:doctorId/stats', requireAdminRole, getDashboardStats);
router.get('/doctor/:doctorId/recent-activities', requireAdminRole, getRecentActivities);
router.get('/doctor/:doctorId/search', requireAdminRole, searchDashboard);
router.get('/doctor/:doctorId/notifications', requireAdminRole, getNotifications);

module.exports = router;