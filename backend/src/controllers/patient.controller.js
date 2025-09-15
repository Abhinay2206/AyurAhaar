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
          path: 'doctor',
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

// Get all patients (for admin/doctor use)
async function getAllPatients(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      prakriti = '',
      healthCondition = '',
      ageGroup = '',
      lifestyle = '',
      treatmentStatus = ''
    } = req.query;

    // Build filter object
    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Prakriti filter
    if (prakriti && prakriti !== 'all') {
      filter['currentPrakriti.primaryDosha'] = prakriti;
    }

    // Health condition filter
    if (healthCondition && healthCondition !== 'all') {
      if (healthCondition === 'none') {
        filter.$or = [
          { healthConditions: { $exists: false } },
          { healthConditions: { $size: 0 } }
        ];
      } else {
        filter.healthConditions = { $in: [new RegExp(healthCondition, 'i')] };
      }
    }

    // Age group filter
    if (ageGroup && ageGroup !== 'all') {
      switch (ageGroup) {
        case 'young':
          filter.age = { $lt: 30 };
          break;
        case 'middle':
          filter.age = { $gte: 30, $lt: 50 };
          break;
        case 'senior':
          filter.age = { $gte: 50 };
          break;
      }
    }

    // Lifestyle filter
    if (lifestyle && lifestyle !== 'all') {
      filter.lifestyle = lifestyle;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get patients with pagination
    const patients = await Patient.find(filter)
      .select('-password -__v')
      .populate('currentPrakriti.assessmentId', 'results')
      .populate('appointments', 'date status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalPatients = await Patient.countDocuments(filter);

    // Transform data to match frontend expectations
    const transformedPatients = patients.map(patient => {
      // Calculate BMI if height and weight are available
      let bmi = null;
      if (patient.height && patient.weight) {
        const heightInM = patient.height / 100;
        bmi = (patient.weight / (heightInM * heightInM)).toFixed(1);
      }

      // Get treatment status based on current plan and appointments
      let treatmentStatus = 'Inactive';
      if (patient.currentPlan && patient.currentPlan.type !== 'none') {
        treatmentStatus = 'Active';
      } else if (patient.appointments && patient.appointments.length > 0) {
        const hasRecentAppointment = patient.appointments.some(apt => 
          new Date(apt.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        );
        if (hasRecentAppointment) {
          treatmentStatus = 'Active';
        } else {
          treatmentStatus = 'Completed';
        }
      }

      // Get the most recent appointment
      const sortedAppointments = patient.appointments ? 
        patient.appointments.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
      const lastVisit = sortedAppointments.length > 0 ? sortedAppointments[0].date : patient.createdAt;
      
      // Get next appointment
      const futureAppointments = patient.appointments ? 
        patient.appointments.filter(apt => new Date(apt.date) > new Date()) : [];
      const nextAppointment = futureAppointments.length > 0 ? 
        futureAppointments.sort((a, b) => new Date(a.date) - new Date(b.date))[0].date : null;

      return {
        patient_id: patient._id,
        name: patient.name,
        age: patient.age || 0,
        gender: patient.gender || 'N/A',
        weight_kg: patient.weight || 0,
        height_cm: patient.height || 0,
        BMI: bmi || 0,
        lifestyle: patient.lifestyle || 'sedentary',
        prakriti: patient.currentPrakriti?.primaryDosha || 'Unknown',
        health_conditions: patient.healthConditions?.join(', ') || 'None',
        allergies: patient.allergies?.join(', ') || 'None',
        preferred_cuisine: patient.preferredCuisine?.join(', ') || 'Not specified',
        phone: patient.phone || 'Not provided',
        email: patient.email,
        address: patient.address || 'Not provided',
        last_visit: lastVisit,
        next_appointment: nextAppointment,
        treatment_status: treatmentStatus,
        joining_date: patient.createdAt
      };
    });

    res.json({
      success: true,
      data: {
        patients: transformedPatients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPatients / parseInt(limit)),
          totalPatients,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching patients' 
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  updateSurveyStatus,
  updatePlan,
  getAllPatients
};