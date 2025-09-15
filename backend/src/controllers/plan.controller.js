const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MealPlan = require('../models/MealPlan');
const axios = require('axios');

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
    } else if (patient.currentPlan && patient.currentPlan.isVisible) {
      // Handle different plan types based on currentPlan.type
      if (patient.currentPlan.type === 'meal-plan' && patient.currentPlan.planId) {
        // Fetch detailed meal plan from MealPlan collection
        console.log('📊 Fetching meal plan from collection:', patient.currentPlan.planId);
        try {
          const mealPlan = await MealPlan.findById(patient.currentPlan.planId);
          if (mealPlan) {
            planToShow = {
              ...patient.currentPlan.toObject(),
              mealPlanDetails: mealPlan.toObject()
            };
            planType = 'meal-plan';
            console.log('📊 Found meal plan in collection');
          } else {
            console.log('⚠️ Meal plan not found in collection, falling back to none');
          }
        } catch (error) {
          console.error('❌ Error fetching meal plan:', error);
        }
      } else if (patient.currentPlan.type === 'ai') {
        // Use AI plan data directly from patient
        planToShow = patient.currentPlan;
        planType = 'ai';
        console.log('📊 Returning AI plan data from patient');
      } else if (patient.currentPlan.type === 'doctor') {
        // Handle doctor plans
        planToShow = patient.currentPlan;
        planType = 'doctor';
        console.log('📊 Returning doctor plan data from patient');
      }
    }

    console.log('📊 Final plan response:', { planType, planToShow: planToShow ? 'exists' : 'null', hasCompletedAppointment });

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

// Generate AI Plan - New endpoint
const generateAIPlan = async (req, res) => {
  try {
    const { patientId } = req.body;
    const userId = req.user?.userId; // From auth middleware

    // Use patientId from request body or fallback to authenticated user
    const targetPatientId = patientId || userId;

    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Fetch patient data from database
    const patient = await Patient.findById(targetPatientId)
      .populate('prakritiAssessments')
      .populate('currentPrakriti.assessmentId');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient has completed survey and prakriti assessment
    if (!patient.surveyCompleted || !patient.prakritiCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your health survey and Prakriti assessment first'
      });
    }

    // Prepare data for AI server
    const aiRequestData = {
      patientId: targetPatientId,
      personalInfo: {
        age: patient.age,
        weight: patient.weight,
        height: patient.height,
        lifestyle: patient.lifestyle,
        allergies: patient.allergies || [],
        healthConditions: patient.healthConditions || [],
        preferredCuisine: patient.preferredCuisine || []
      },
      prakritiInfo: {
        primaryDosha: patient.currentPrakriti?.primaryDosha || 'Unknown',
        secondaryDosha: patient.currentPrakriti?.secondaryDosha || 'Unknown',
        isDual: patient.currentPrakriti?.isDual || false
      }
    };

    console.log('🤖 Sending data to AI server for plan generation...');

    // Call AI server
    const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:5000';
    const aiResponse = await axios.post(`${aiServerUrl}/generate-plan`, aiRequestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 120000 // 2 minutes timeout for AI processing
    });

    if (!aiResponse.data || !aiResponse.data.success) {
      throw new Error('AI server failed to generate plan');
    }

    const generatedPlan = aiResponse.data.plan;

    // Save the generated plan to database
    const updatedPatient = await Patient.findByIdAndUpdate(
      targetPatientId,
      {
        currentPlan: {
          type: 'ai',
          planId: null, // AI plans don't have separate plan documents
          isVisible: true,
          createdAt: new Date(),
          lastModified: new Date(),
          aiPlan: generatedPlan // Store the AI plan data directly
        }
      },
      { new: true }
    );

    console.log('✅ AI plan generated and saved successfully');

    res.json({
      success: true,
      message: 'AI plan generated successfully',
      data: {
        plan: generatedPlan,
        createdAt: updatedPatient.currentPlan.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error generating AI plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI plan',
      error: error.message
    });
  }
};

// Reset plan for patient
const resetPlan = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Reset the current plan to empty/none
    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      {
        currentPlan: {
          type: 'none',
          planId: null,
          isVisible: false,
          createdAt: null,
          lastModified: new Date(),
          aiPlan: null
        }
      },
      { new: true }
    );

    console.log(`✅ Plan reset successfully for patient: ${patientId}`);

    res.json({
      success: true,
      message: 'Plan reset successfully',
      data: updatedPatient.currentPlan
    });

  } catch (error) {
    console.error('❌ Error resetting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset plan',
      error: error.message
    });
  }
};

module.exports = {
  getCurrentPlan,
  setAIPlan,
  clearAIPlanOnDoctorCompletion,
  generateAIPlan,
  resetPlan
};