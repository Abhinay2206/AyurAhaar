const Patient = require('../models/Patient');

// Get patient profile
async function getProfile(req, res) {
  try {
    const patient = await Patient.findById(req.user.userId)
      .populate('currentPlan.planId')
      .populate('appointments')
      .select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching profile' 
    });
  }
}

// Update patient profile
async function updateProfile(req, res) {
  try {
    const patientId = req.user.userId;
    const allowedUpdates = [
      'name', 'phone', 'age', 'weight', 'height', 'lifestyle', 
      'allergies', 'healthConditions'
    ];
    
    // Filter only allowed fields
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate required fields if provided
    if (updates.age && (updates.age < 1 || updates.age > 120)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Age must be between 1 and 120' 
      });
    }

    if (updates.weight && (updates.weight < 10 || updates.weight > 500)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Weight must be between 10 and 500 kg' 
      });
    }

    if (updates.height && (updates.height < 50 || updates.height > 250)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Height must be between 50 and 250 cm' 
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      patientId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errorMessages 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating profile' 
    });
  }
}

// Get patient dashboard data
async function getDashboard(req, res) {
  try {
    const patient = await Patient.findById(req.user.userId)
      .populate('currentPlan.planId')
      .populate({
        path: 'appointments',
        populate: {
          path: 'doctorId',
          select: 'name specialization'
        }
      })
      .select('-password');

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Calculate dashboard statistics
    const upcomingAppointments = patient.appointments.filter(apt => 
      new Date(apt.date) >= new Date() && apt.status === 'confirmed'
    );

    const completedAppointments = patient.appointments.filter(apt => 
      apt.status === 'completed'
    );

    const dashboardData = {
      profile: {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        weight: patient.weight,
        height: patient.height,
        lifestyle: patient.lifestyle,
        surveyCompleted: patient.surveyCompleted
      },
      currentPlan: patient.currentPlan,
      statistics: {
        totalAppointments: patient.appointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments: completedAppointments.length,
        hasPlan: patient.currentPlan.type !== 'none'
      },
      recentAppointments: patient.appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching dashboard data' 
    });
  }
}

// Update survey completion status
async function updateSurveyStatus(req, res) {
  try {
    const { surveyCompleted } = req.body;
    
    if (typeof surveyCompleted !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'surveyCompleted must be a boolean value'
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.user.userId,
      { surveyCompleted, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      message: 'Survey status updated successfully',
      data: { surveyCompleted: patient.surveyCompleted }
    });
  } catch (error) {
    console.error('Error updating survey status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating survey status' 
    });
  }
}

// Update patient plan
async function updatePlan(req, res) {
  try {
    const { type, planId, isVisible } = req.body;
    
    const validTypes = ['ai', 'doctor', 'none'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Plan type must be one of: ai, doctor, none'
      });
    }

    const updateData = {
      'currentPlan.type': type,
      'currentPlan.isVisible': isVisible !== undefined ? isVisible : true,
      'currentPlan.lastModified': new Date()
    };

    if (type !== 'none' && planId) {
      updateData['currentPlan.planId'] = planId;
      updateData['currentPlan.createdAt'] = new Date();
    } else if (type === 'none') {
      updateData['currentPlan.planId'] = null;
      updateData['currentPlan.createdAt'] = null;
    }

    const patient = await Patient.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).populate('currentPlan.planId').select('-password');

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: { currentPlan: patient.currentPlan }
    });
  } catch (error) {
    console.error('Error updating patient plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating plan' 
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  updateSurveyStatus,
  updatePlan
};