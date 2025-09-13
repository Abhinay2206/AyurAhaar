const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  completeAppointment,
  getAppointmentById,
  rescheduleAppointment,
  deleteAppointment,
  cleanupCancelledAppointments
} = require('../controllers/appointment.controller');

// Create new appointment
router.post('/create', createAppointment);

// Get appointments for a patient
router.get('/patient/:patientId', getPatientAppointments);

// Get appointments for a doctor
router.get('/doctor/:doctorId', getDoctorAppointments);

// Get appointment by ID
router.get('/:appointmentId', getAppointmentById);

// Update appointment status
router.put('/:appointmentId/status', updateAppointmentStatus);

// Reschedule appointment
router.put('/:appointmentId/reschedule', rescheduleAppointment);

// Complete appointment (doctor action)
router.put('/:appointmentId/complete', completeAppointment);

// Delete appointment
router.delete('/:appointmentId', deleteAppointment);

// Cleanup cancelled appointments from Patient and Doctor models
router.post('/cleanup/cancelled', cleanupCancelledAppointments);

module.exports = router;