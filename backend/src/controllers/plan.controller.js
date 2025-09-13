const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// Get current plan for a patient with display rules
const getCurrentPlan = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId)
      .populate('currentPlan.planId')
      .populate({
        path: 'appointments',
        match: { status: { $in: ['confirmed', 'completed'] } },
        options: { sort: { date: -1 } }
      });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if there are any completed appointments
    const completedAppointments = patient.appointments.filter(apt => apt.status === 'completed');
    const hasCompletedAppointment = completedAppointments.length > 0;

    let planToShow = null;
    let planType = 'none';

    // Plan Display Rules:
    if (hasCompletedAppointment) {
      // If patient has completed appointments, show doctor's plan only
      const latestAppointment = completedAppointments[0];
      if (latestAppointment.dietPlan && latestAppointment.dietPlan.isVisible) {
        planToShow = latestAppointment.dietPlan;
        planType = 'doctor';
      }
    } else if (patient.currentPlan && patient.currentPlan.type === 'ai' && patient.currentPlan.isVisible) {
      // If no completed appointments and patient has AI plan, show AI plan
      planToShow = patient.currentPlan;
      planType = 'ai';
    }

    res.json({
      success: true,
      data: {
        planType,
        plan: planToShow,
        hasCompletedAppointment,
        patientId: patient._id
      }
    });

  } catch (error) {
    console.error('Error getting current plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Set AI plan for patient
const setAIPlan = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { planData } = req.body;

    // Check if patient has any completed appointments
    const patient = await Patient.findById(patientId)
      .populate('appointments');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const hasCompletedAppointment = patient.appointments.some(apt => apt.status === 'completed');

    if (hasCompletedAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Cannot set AI plan - patient has completed appointments. Doctor plan takes precedence.'
      });
    }

    // Update patient with AI plan
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      {
        currentPlan: {
          type: 'ai',
          planId: null, // AI plans don't have separate ID
          isVisible: true,
          createdAt: new Date(),
          lastModified: new Date(),
          ...planData
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'AI plan set successfully',
      data: updatedPatient.currentPlan
    });

  } catch (error) {
    console.error('Error setting AI plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Clear AI plan when doctor appointment is completed
const clearAIPlanOnDoctorCompletion = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.status !== 'completed') {
      return;
    }

    // Clear AI plan for this patient
    await Patient.findByIdAndUpdate(
      appointment.patient,
      {
        currentPlan: {
          type: 'none',
          planId: null,
          isVisible: false,
          createdAt: null,
          lastModified: new Date()
        }
      }
    );

    console.log(`AI plan cleared for patient ${appointment.patient} after appointment completion`);
  } catch (error) {
    console.error('Error clearing AI plan:', error);
  }
};

module.exports = {
  getCurrentPlan,
  setAIPlan,
  clearAIPlanOnDoctorCompletion
};