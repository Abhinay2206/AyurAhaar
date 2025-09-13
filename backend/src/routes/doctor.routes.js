const express = require('express');
const {
  getAllDoctors,
  getDoctorsByLocation,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctor.controller');
const { authenticateToken, requireDoctorRole } = require('../middleware/auth.middleware');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MealPlan = require('../models/MealPlan');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllDoctors);
router.get('/search', getDoctorsByLocation);
router.get('/:id', getDoctorById);

// Admin routes (would need authentication in production)
router.post('/', createDoctor);
router.put('/admin/:id', updateDoctor);
router.delete('/admin/:id', deleteDoctor);

// Mount authenticated routes under /doctor-portal prefix
router.use('/doctor-portal', authenticateToken, requireDoctorRole);

// Get doctor profile
router.get('/doctor-portal/profile', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.userId)
      .select('-password')
      .populate('specializations');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor profile
router.put('/doctor-portal/profile', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.user.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard - Get overview statistics
router.get('/doctor-portal/dashboard/stats', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    // Get total patients assigned to this doctor
    const totalPatients = await Patient.countDocuments({ assignedDoctor: doctorId });
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Get pending appointments (future appointments)
    const pendingAppointments = await Appointment.countDocuments({
      doctorId: doctorId,
      appointmentDate: { $gt: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    // Get active meal plans created by this doctor
    const activeMealPlans = await MealPlan.countDocuments({
      createdBy: doctorId,
      isActive: true
    });
    
    res.json({
      totalPatients,
      todayAppointments,
      pendingAppointments,
      activeMealPlans
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard - Combined search for patients and appointments
router.get('/doctor-portal/dashboard/search', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { query: searchQuery, limit = 10 } = req.query;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchRegex = new RegExp(searchQuery, 'i');
    
    // Search patients
    const patients = await Patient.find({
      assignedDoctor: doctorId,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { medicalHistory: searchRegex },
        { allergies: searchRegex }
      ]
    })
    .select('firstName lastName email phone age gender createdAt')
    .limit(limit)
    .sort({ createdAt: -1 });
    
    // Search appointments with patient data
    const appointments = await Appointment.aggregate([
      { $match: { doctorId: doctorId } },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientData'
        }
      },
      { $unwind: '$patientData' },
      {
        $match: {
          $or: [
            { 'patientData.firstName': searchRegex },
            { 'patientData.lastName': searchRegex },
            { 'patientData.email': searchRegex },
            { 'patientData.phone': searchRegex },
            { 'appointmentType': searchRegex },
            { 'symptoms': searchRegex },
            { 'status': searchRegex }
          ]
        }
      },
      {
        $project: {
          appointmentDate: 1,
          appointmentTime: 1,
          appointmentType: 1,
          symptoms: 1,
          status: 1,
          createdAt: 1,
          patientName: {
            $concat: ['$patientData.firstName', ' ', '$patientData.lastName']
          },
          patientEmail: '$patientData.email',
          patientId: '$patientData._id'
        }
      },
      { $sort: { appointmentDate: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({
      patients: patients.map(p => ({
        ...p.toObject(),
        type: 'patient',
        displayName: `${p.firstName} ${p.lastName}`,
        displayInfo: p.email
      })),
      appointments: appointments.map(a => ({
        ...a,
        type: 'appointment',
        displayName: `${a.patientName} - ${a.appointmentType}`,
        displayInfo: `${new Date(a.appointmentDate).toLocaleDateString()} - ${a.status}`
      })),
      totalResults: patients.length + appointments.length
    });
  } catch (error) {
    console.error('Error performing dashboard search:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor's patients
router.get('/doctor-portal/patients', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter
    let filter = { assignedDoctor: doctorId };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { age: { $regex: search, $options: 'i' } },
        { gender: { $regex: search, $options: 'i' } },
        { medicalHistory: { $regex: search, $options: 'i' } },
        { allergies: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const patients = await Patient.find(filter)
      .select('-password')
      .populate('prakritiAssessment')
      .populate({
        path: 'appointments',
        select: 'appointmentDate status appointmentType',
        options: { limit: 5, sort: { appointmentDate: -1 } }
      })
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalPatients = await Patient.countDocuments(filter);
    
    // Add additional stats for each patient
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const patientObj = patient.toObject();
        
        // Get appointment count
        const appointmentCount = await Appointment.countDocuments({
          patient: patient._id,
          doctorId: doctorId
        });
        
        // Get latest appointment
        const latestAppointment = await Appointment.findOne({
          patient: patient._id,
          doctorId: doctorId
        }).sort({ appointmentDate: -1 });
        
        // Get active meal plans count
        const activeMealPlans = await MealPlan.countDocuments({
          patientId: patient._id,
          createdBy: doctorId,
          isActive: true
        });
        
        return {
          ...patientObj,
          stats: {
            totalAppointments: appointmentCount,
            latestAppointment: latestAppointment ? {
              date: latestAppointment.appointmentDate,
              status: latestAppointment.status
            } : null,
            activeMealPlans
          }
        };
      })
    );
    
    res.json({
      patients: patientsWithStats,
      totalPages: Math.ceil(totalPatients / limit),
      currentPage: parseInt(page),
      total: totalPatients,
      hasNextPage: page < Math.ceil(totalPatients / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific patient details
router.get('/doctor-portal/patients/:patientId', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const patient = await Patient.findOne({
      _id: req.params.patientId,
      assignedDoctor: doctorId
    })
      .select('-password')
      .populate('prakritiAssessment')
      .populate('mealPlans');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or not assigned to you' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor's appointments
router.get('/doctor-portal/appointments', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { page = 1, limit = 10, status, date, search } = req.query;
    
    // Build filter
    let filter = { doctorId: doctorId };
    
    if (status) {
      filter.status = status;
    }
    
    if (date) {
      const queryDate = new Date(date);
      const nextDay = new Date(queryDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filter.appointmentDate = {
        $gte: queryDate,
        $lt: nextDay
      };
    }
    
    // First, get appointments with basic filter
    let appointments;
    let totalAppointments;
    
    if (search) {
      // For search, we need to use aggregation to search in populated patient data
      const searchRegex = new RegExp(search, 'i');
      
      appointments = await Appointment.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'patients',
            localField: 'patient',
            foreignField: '_id',
            as: 'patientData'
          }
        },
        { $unwind: '$patientData' },
        {
          $match: {
            $or: [
              { 'patientData.firstName': searchRegex },
              { 'patientData.lastName': searchRegex },
              { 'patientData.email': searchRegex },
              { 'patientData.phone': searchRegex },
              { 'appointmentType': searchRegex },
              { 'symptoms': searchRegex }
            ]
          }
        },
        {
          $project: {
            appointmentDate: 1,
            appointmentTime: 1,
            appointmentType: 1,
            symptoms: 1,
            status: 1,
            consultationFee: 1,
            notes: 1,
            createdAt: 1,
            updatedAt: 1,
            doctorId: 1,
            patient: 1,
            patientId: {
              _id: '$patientData._id',
              firstName: '$patientData.firstName',
              lastName: '$patientData.lastName',
              email: '$patientData.email',
              phone: '$patientData.phone'
            }
          }
        },
        { $sort: { appointmentDate: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
      ]);
      
      // Count total for pagination
      const countPipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'patients',
            localField: 'patient',
            foreignField: '_id',
            as: 'patientData'
          }
        },
        { $unwind: '$patientData' },
        {
          $match: {
            $or: [
              { 'patientData.firstName': searchRegex },
              { 'patientData.lastName': searchRegex },
              { 'patientData.email': searchRegex },
              { 'patientData.phone': searchRegex },
              { 'appointmentType': searchRegex },
              { 'symptoms': searchRegex }
            ]
          }
        },
        { $count: 'total' }
      ];
      
      const countResult = await Appointment.aggregate(countPipeline);
      totalAppointments = countResult.length > 0 ? countResult[0].total : 0;
    } else {
      // Regular query without search
      appointments = await Appointment.find(filter)
        .populate('patient', 'firstName lastName email phone')
        .sort({ appointmentDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      totalAppointments = await Appointment.countDocuments(filter);
      
      // Normalize the structure to match aggregation result
      appointments = appointments.map(apt => ({
        ...apt.toObject(),
        patientId: apt.patient
      }));
    }
    
    res.json({
      appointments,
      totalPages: Math.ceil(totalAppointments / limit),
      currentPage: parseInt(page),
      total: totalAppointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.patch('/doctor-portal/appointments/:appointmentId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const doctorId = req.user.userId;
    
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, doctorId: doctorId },
      { status },
      { new: true }
    ).populate('patientId', 'firstName lastName email');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or not assigned to you' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor's meal plans
router.get('/doctor-portal/meal-plans', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    const { page = 1, limit = 10, patientId } = req.query;
    
    let filter = { createdBy: doctorId };
    
    if (patientId) {
      filter.patientId = patientId;
    }
    
    const mealPlans = await MealPlan.find(filter)
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalMealPlans = await MealPlan.countDocuments(filter);
    
    res.json({
      mealPlans,
      totalPages: Math.ceil(totalMealPlans / limit),
      currentPage: page,
      total: totalMealPlans
    });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create meal plan for patient
router.post('/doctor-portal/meal-plans', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    // Verify patient is assigned to this doctor
    const patient = await Patient.findOne({
      _id: req.body.patientId,
      assignedDoctor: doctorId
    });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or not assigned to you' });
    }
    
    const mealPlan = new MealPlan({
      ...req.body,
      createdBy: doctorId
    });
    
    await mealPlan.save();
    await mealPlan.populate('patientId', 'firstName lastName');
    
    res.status(201).json(mealPlan);
  } catch (error) {
    console.error('Error creating meal plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activities for dashboard
router.get('/doctor-portal/dashboard/recent-activities', async (req, res) => {
  try {
    const doctorId = req.user.userId;
    
    // Get recent appointments
    const recentAppointments = await Appointment.find({ doctorId })
      .populate('patientId', 'firstName lastName')
      .sort({ appointmentDate: -1 })
      .limit(5);
    
    // Get recently created meal plans
    const recentMealPlans = await MealPlan.find({ createdBy: doctorId })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get recently registered patients
    const recentPatients = await Patient.find({ assignedDoctor: doctorId })
      .select('firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      recentAppointments,
      recentMealPlans,
      recentPatients
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;