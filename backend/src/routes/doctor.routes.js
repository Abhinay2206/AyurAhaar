const express = require('express');
const {
  getAllDoctors,
  getDoctorsByLocation,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctor.controller');

const router = express.Router();

// Public routes (no authentication required for now)
router.get('/', getAllDoctors);
router.get('/search', getDoctorsByLocation);
router.get('/:id', getDoctorById);

// Admin routes (would need authentication in production)
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;