const TreatmentPlan = require('../models/TreatmentPlan');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Food = require('../models/Food');
const Appointment = require('../models/Appointment');

// Get all treatment plans with advanced filtering and search
const getAllTreatmentPlans = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      planType,
      patientId,
      doctorId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build the match conditions for TreatmentPlan collection
    const matchConditions = {};

    if (status && status !== 'all') {
      matchConditions.status = status;
    }

    if (planType && planType !== 'all') {
      matchConditions.planType = planType;
    }

    if (patientId) {
      matchConditions.patient = new mongoose.Types.ObjectId(patientId);
    }

    if (doctorId) {
      matchConditions.doctor = new mongoose.Types.ObjectId(doctorId);
    }

    // Build the aggregation pipeline for TreatmentPlan collection
    const treatmentPlanPipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: {
          path: '$patientInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$doctorInfo',
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    // Get AI plans from Patient collection
    const aiPlanPipeline = [
      {
        $match: {
          'currentPlan.type': 'ai',
          'currentPlan.aiPlan': { $exists: true, $ne: null }
        }
      },
      {
        $addFields: {
          // Transform AI plan to match TreatmentPlan structure
          planType: 'AI',
          status: 'approved',
          title: { $concat: ['AI Plan for ', '$name'] },
          description: 'AI-generated personalized Ayurvedic treatment plan',
          createdAt: '$currentPlan.createdAt',
          updatedAt: '$currentPlan.updatedAt',
          patientInfo: '$$ROOT',
          dietaryRecommendations: {
            $map: {
              input: { $objectToArray: '$currentPlan.aiPlan.weekly_plan' },
              as: 'day',
              in: {
                day: '$$day.k',
                meals: '$$day.v'
              }
            }
          },
          aiMetadata: {
            generatedAt: '$currentPlan.createdAt',
            model: 'AI Assistant',
            confidence: 0.95
          }
        }
      }
    ];

    // Execute both pipelines
    const [treatmentPlans, aiPlans] = await Promise.all([
      TreatmentPlan.aggregate(treatmentPlanPipeline),
      Patient.aggregate(aiPlanPipeline)
    ]);

    // Combine results
    let allPlans = [
      ...treatmentPlans.map(plan => ({ ...plan, source: 'treatmentplan' })),
      ...aiPlans.map(plan => ({ ...plan, source: 'aiplan' }))
    ];

    // Apply search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      allPlans = allPlans.filter(plan => 
        (plan.patientInfo?.name && searchRegex.test(plan.patientInfo.name)) ||
        (plan.patientInfo?.email && searchRegex.test(plan.patientInfo.email)) ||
        (plan.doctorInfo?.name && searchRegex.test(plan.doctorInfo.name)) ||
        (plan.title && searchRegex.test(plan.title)) ||
        (plan.description && searchRegex.test(plan.description))
      );
    }

    // Apply sorting
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    allPlans.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      if (sortDirection === 1) {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const total = allPlans.length;
    const startIndex = (page - 1) * limit;
    const paginatedPlans = allPlans.slice(startIndex, startIndex + parseInt(limit));

    // Transform the results to a more frontend-friendly format
    const transformedPlans = paginatedPlans.map(plan => ({
      id: plan._id,
      title: plan.title,
      description: plan.description,
      planType: plan.planType,
      status: plan.status,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      source: plan.source,
      patient: {
        id: plan.patientInfo?._id,
        name: plan.patientInfo?.name,
        email: plan.patientInfo?.email,
        age: plan.patientInfo?.age,
        bodyWeight: plan.patientInfo?.bodyWeight,
        height: plan.patientInfo?.height
      },
      doctor: {
        id: plan.doctorInfo?._id,
        name: plan.doctorInfo?.name,
        email: plan.doctorInfo?.email,
        specialization: plan.doctorInfo?.specialization
      },
      dietaryRecommendations: plan.dietaryRecommendations,
      lifestyleRecommendations: plan.lifestyleRecommendations,
      herbalTreatments: plan.herbalTreatments,
      duration: plan.duration,
      followUpDate: plan.followUpDate,
      notes: plan.notes,
      version: plan.version,
      isApproved: plan.isApproved,
      approvedBy: plan.approvedBy,
      approvedAt: plan.approvedAt,
      aiMetadata: plan.aiMetadata,
      // For AI plans from Patient model
      weeklyPlan: plan.source === 'aiplan' ? plan.currentPlan?.aiPlan?.weekly_plan : null
    }));

    res.status(200).json({
      success: true,
      data: {
        plans: transformedPlans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment plans',
      error: error.message
    });
  }
};

// Get treatment plan by ID with full details
const getTreatmentPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const treatmentPlan = await TreatmentPlan.findById(id)
      .populate('patient', 'name email phone age gender')
      .populate('doctor', 'name specialization experience location')
      .populate('consultation', 'appointmentId date time status')
      .populate({
        path: 'dietaryRecommendations.foodId',
        model: 'Food'
      })
      .populate({
        path: 'mealPlan.breakfast.foodId mealPlan.lunch.foodId mealPlan.dinner.foodId mealPlan.snacks.foodId',
        model: 'Food'
      });

    if (!treatmentPlan) {
      return res.status(404).json({
        success: false,
        message: 'Treatment plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: treatmentPlan
    });
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch treatment plan',
      error: error.message
    });
  }
};

// Get treatment plans for a specific patient
const getPatientTreatmentPlans = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    const filter = { patient: patientId };
    if (status) filter.status = status;

    const treatmentPlans = await TreatmentPlan.find(filter)
      .populate('doctor', 'name specialization')
      .populate('consultation', 'appointmentId date time')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: treatmentPlans
    });
  } catch (error) {
    console.error('Error fetching patient treatment plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient treatment plans',
      error: error.message
    });
  }
};

// Create new treatment plan
const createTreatmentPlan = async (req, res) => {
  try {
    const treatmentPlanData = req.body;

    // Validate required fields
    if (!treatmentPlanData.patient || !treatmentPlanData.title) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and title are required'
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(treatmentPlanData.patient);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor exists if provided
    if (treatmentPlanData.doctor) {
      const doctor = await Doctor.findById(treatmentPlanData.doctor);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
      }
    }

    // Create treatment plan
    const treatmentPlan = new TreatmentPlan(treatmentPlanData);
    await treatmentPlan.save();

    // Populate for response
    await treatmentPlan.populate('patient', 'name email phone');
    await treatmentPlan.populate('doctor', 'name specialization');

    res.status(201).json({
      success: true,
      message: 'Treatment plan created successfully',
      data: treatmentPlan
    });
  } catch (error) {
    console.error('Error creating treatment plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create treatment plan',
      error: error.message
    });
  }
};

// Update treatment plan
const updateTreatmentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find existing treatment plan
    const existingPlan = await TreatmentPlan.findById(id);
    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Treatment plan not found'
      });
    }

    // If this is a major update, create new version
    if (updateData.createNewVersion) {
      const newVersion = new TreatmentPlan({
        ...existingPlan.toObject(),
        _id: undefined,
        planId: undefined,
        version: existingPlan.version + 1,
        previousVersions: [...existingPlan.previousVersions, existingPlan._id],
        ...updateData,
        createNewVersion: undefined
      });

      await newVersion.save();
      
      // Update old version status
      existingPlan.status = 'revised';
      await existingPlan.save();

      await newVersion.populate('patient', 'name email phone');
      await newVersion.populate('doctor', 'name specialization');

      return res.status(200).json({
        success: true,
        message: 'New version of treatment plan created successfully',
        data: newVersion
      });
    }

    // Regular update
    const updatedPlan = await TreatmentPlan.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    res.status(200).json({
      success: true,
      message: 'Treatment plan updated successfully',
      data: updatedPlan
    });
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update treatment plan',
      error: error.message
    });
  }
};

// Delete treatment plan
const deleteTreatmentPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const treatmentPlan = await TreatmentPlan.findById(id);
    if (!treatmentPlan) {
      return res.status(404).json({
        success: false,
        message: 'Treatment plan not found'
      });
    }

    // Instead of hard delete, update status to cancelled
    treatmentPlan.status = 'cancelled';
    await treatmentPlan.save();

    res.status(200).json({
      success: true,
      message: 'Treatment plan cancelled successfully'
    });
  } catch (error) {
    console.error('Error deleting treatment plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete treatment plan',
      error: error.message
    });
  }
};

// Get patients with consultations (completed, consulting, or with plans)
const getPatientsWithConsultations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      hasPlans,
      search 
    } = req.query;

    // Build aggregation pipeline
    const pipeline = [
      // Lookup appointments
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'patient',
          as: 'appointments'
        }
      },
      // Lookup treatment plans
      {
        $lookup: {
          from: 'treatmentplans',
          localField: '_id',
          foreignField: 'patient',
          as: 'treatmentPlans'
        }
      },
      // Add computed fields
      {
        $addFields: {
          hasCompletedConsultations: {
            $gt: [
              { $size: { $filter: { input: '$appointments', cond: { $eq: ['$$this.status', 'completed'] } } } },
              0
            ]
          },
          hasActiveConsultations: {
            $gt: [
              { $size: { $filter: { input: '$appointments', cond: { $in: ['$$this.status', ['confirmed', 'pending']] } } } },
              0
            ]
          },
          // Check for consultation in progress (using consultationStatus)
          hasConsultationInProgress: {
            $eq: ['$consultationStatus', 'consulting']
          },
          hasTreatmentPlans: {
            $gt: [{ $size: '$treatmentPlans' }, 0]
          },
          // Check for AI plans in currentPlan field
          hasAIPlan: {
            $and: [
              { $ne: ['$currentPlan', null] },
              { $eq: ['$currentPlan.type', 'ai'] },
              { $ne: ['$currentPlan.aiPlan', null] }
            ]
          },
          totalConsultations: { $size: '$appointments' },
          totalPlans: { 
            $add: [
              { $size: '$treatmentPlans' },
              { $cond: [{ $and: [{ $ne: ['$currentPlan', null] }, { $eq: ['$currentPlan.type', 'ai'] }] }, 1, 0] }
            ]
          },
          latestConsultation: {
            $arrayElemAt: [
              { $sortArray: { input: '$appointments', sortBy: { createdAt: -1 } } },
              0
            ]
          },
          latestPlan: {
            $arrayElemAt: [
              { $sortArray: { input: '$treatmentPlans', sortBy: { createdAt: -1 } } },
              0
            ]
          }
        }
      }
    ];

    // Add filters
    const matchConditions = {};

    if (status === 'completed') {
      matchConditions.hasCompletedConsultations = true;
    } else if (status === 'consulting') {
      matchConditions.hasConsultationInProgress = true; // Only show patients actively consulting
    } else if (status === 'with-plans') {
      matchConditions.$or = [
        { hasTreatmentPlans: true },
        { hasAIPlan: true }
      ];
    }

    if (hasPlans === 'true') {
      matchConditions.$or = [
        { hasTreatmentPlans: true },
        { hasAIPlan: true }
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      matchConditions.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Add match stage if we have conditions
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Patient.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    // Execute pipeline
    const patients = await Patient.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: {
        patients,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching patients with consultations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients with consultations',
      error: error.message
    });
  }
};

// Approve treatment plan
const approveTreatmentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;

    const treatmentPlan = await TreatmentPlan.findById(id);
    if (!treatmentPlan) {
      return res.status(404).json({
        success: false,
        message: 'Treatment plan not found'
      });
    }

    treatmentPlan.status = 'active';
    treatmentPlan.approvedBy = doctorId;
    treatmentPlan.approvedAt = new Date();
    
    await treatmentPlan.save();

    res.status(200).json({
      success: true,
      message: 'Treatment plan approved successfully',
      data: treatmentPlan
    });
  } catch (error) {
    console.error('Error approving treatment plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve treatment plan',
      error: error.message
    });
  }
};

// Start consultation for a patient
const startConsultation = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update consultation status
    patient.consultationStatus = 'consulting';
    patient.consultationStartedAt = new Date();
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Consultation started successfully',
      data: {
        patientId: patient._id,
        consultationStatus: patient.consultationStatus,
        consultationStartedAt: patient.consultationStartedAt
      }
    });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start consultation',
      error: error.message
    });
  }
};

// Complete consultation for a patient
const completeConsultation = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Update consultation status
    patient.consultationStatus = 'completed';
    patient.consultationCompletedAt = new Date();
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Consultation completed successfully',
      data: {
        patientId: patient._id,
        consultationStatus: patient.consultationStatus,
        consultationCompletedAt: patient.consultationCompletedAt
      }
    });
  } catch (error) {
    console.error('Error completing consultation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete consultation',
      error: error.message
    });
  }
};

module.exports = {
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
};