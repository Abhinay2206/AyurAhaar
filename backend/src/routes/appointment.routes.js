const express = require('express');
const router = express.Router();
const { authenticateToken, requirePatientRole } = require('../middleware/auth.middleware');
const {
  createAppointment,
  getAllAppointments,
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

// Get all appointments (admin route)
router.get('/all', getAllAppointments);

// Get my appointments (for authenticated patient)
router.get('/my-appointments', authenticateToken, requirePatientRole, async (req, res) => {
  try {
    const appointments = await require('../models/Appointment').find({ patient: req.user.userId })
      .populate('doctor', 'name specialization location')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
});

// Get appointments for a patient (admin route)
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