const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { clearAIPlanOnDoctorCompletion } = require('./plan.controller');
const NotificationService = require('../services/notificationService');

const notificationService = new NotificationService();

// Create a new appointment
const createAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      doctorName,
      doctorSpecialization,
      consultationFee,
      date,
      time,
      patientDetails,
      consultationDetails,
      paymentMethod,
      paymentStatus,
      appointmentId
    } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !date || !time || !patientDetails || !consultationDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      doctorName,
      doctorSpecialization,
      consultationFee,
      date: new Date(date),
      time,
      appointmentId: appointmentId || `APT${Date.now()}`,
      patientDetails,
      consultationDetails,
      paymentMethod,
      paymentStatus: paymentStatus || 'paid',
      status: 'confirmed'
    });

    const savedAppointment = await appointment.save();
    console.log('Appointment saved with ID:', savedAppointment._id);

    // Update patient and doctor records
    const patientUpdate = await Patient.findByIdAndUpdate(
      patientId,
      { $push: { appointments: savedAppointment._id } },
      { new: true }
    );
    console.log('Patient updated with appointment. Appointments count:', patientUpdate?.appointments?.length);

    const doctorUpdate = await Doctor.findByIdAndUpdate(
      doctorId,
      { $push: { appointments: savedAppointment._id } },
      { new: true }
    );
    console.log('Doctor updated with appointment. Appointments count:', doctorUpdate?.appointments?.length);

    // Get patient details for notifications
    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    // Send booking confirmation notifications
    if (patient && doctor) {
      try {
        const appointmentData = {
          appointmentId: savedAppointment.appointmentId,
          date: savedAppointment.date,
          time: savedAppointment.time,
          doctorName: savedAppointment.doctorName || doctor.name,
          doctorSpecialization: savedAppointment.doctorSpecialization || doctor.specialization,
          consultationFee: savedAppointment.consultationFee,
          patientDetails: {
            name: savedAppointment.patientDetails.name,
            email: savedAppointment.patientDetails.email,
            phone: savedAppointment.patientDetails.phone
          },
          doctorDetails: {
            name: doctor.name,
            specialization: doctor.specialization,
            location: doctor.location
          }
        };
        
        await notificationService.sendAppointmentBookingNotifications(appointmentData);
      } catch (notificationError) {
        console.error('Error sending booking notifications:', notificationError);
        // Don't fail the appointment creation if notifications fail
      }
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment: savedAppointment
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all appointments for admin view
const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'priority' // priority, date, status
    } = req.query;

    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build search filter
    let searchFilter = {};
    if (search) {
      searchFilter = {
        $or: [
          { 'patientDetails.name': { $regex: search, $options: 'i' } },
          { 'patientDetails.email': { $regex: search, $options: 'i' } },
          { 'patientDetails.phone': { $regex: search, $options: 'i' } },
          { doctorName: { $regex: search, $options: 'i' } },
          { appointmentId: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Combine filters
    const finalFilter = { ...filter, ...searchFilter };

    // Build sort object
    let sortObject = {};
    if (sortBy === 'priority') {
      // Sort by status priority (scheduled first, then completed)
      const statusPriority = {
        'confirmed': 1,
        'pending': 2,
        'completed': 3,
        'cancelled': 4
      };
      
      // We'll handle this in aggregation pipeline
      sortObject = { date: 1, time: 1 };
    } else if (sortBy === 'date') {
      sortObject = { date: -1, time: -1 };
    } else if (sortBy === 'status') {
      sortObject = { status: 1, date: 1 };
    }

    // Get total count for pagination
    const total = await Appointment.countDocuments(finalFilter);

    // Get appointments with pagination
    let appointments;
    if (sortBy === 'priority') {
      // Use aggregation for custom status sorting
      appointments = await Appointment.aggregate([
        { $match: finalFilter },
        {
          $addFields: {
            statusPriority: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'confirmed'] }, then: 1 },
                  { case: { $eq: ['$status', 'pending'] }, then: 2 },
                  { case: { $eq: ['$status', 'completed'] }, then: 3 },
                  { case: { $eq: ['$status', 'cancelled'] }, then: 4 }
                ],
                default: 5
              }
            }
          }
        },
        { $sort: { statusPriority: 1, date: 1, time: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
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
            from: 'doctors',
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo'
          }
        }
      ]);
    } else {
      appointments = await Appointment.find(finalFilter)
        .populate('patient', 'name email phone')
        .populate('doctor', 'name specialization location')
        .sort(sortObject)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    // Transform data for frontend
    const transformedAppointments = appointments.map(appointment => {
      const apt = appointment._doc || appointment;
      return {
        id: apt._id,
        appointmentId: apt.appointmentId,
        patientId: apt.patient, // Add patient ID for consultation workflow
        patientName: apt.patientDetails?.name || apt.patientInfo?.[0]?.name || 'Unknown',
        patientEmail: apt.patientDetails?.email || apt.patientInfo?.[0]?.email,
        patientPhone: apt.patientDetails?.phone || apt.patientInfo?.[0]?.phone,
        doctorName: apt.doctorName || apt.doctorInfo?.[0]?.name,
        doctorSpecialization: apt.doctorSpecialization || apt.doctorInfo?.[0]?.specialization,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        type: apt.consultationDetails?.type || 'Consultation',
        notes: apt.consultationDetails?.symptoms || apt.consultationDetails?.notes || '',
        diagnosis: apt.consultationDetails?.diagnosis || '',
        duration: apt.consultationDetails?.duration || '30 min',
        consultationFee: apt.consultationFee,
        paymentStatus: apt.paymentStatus,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: {
        appointments: transformedAppointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get appointments for a patient
const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patient: patientId })
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
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get appointments for a doctor
const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email phone')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate('patient').populate('doctor');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Send cancellation notification if status is cancelled
    if (status === 'cancelled' && appointment.patient && appointment.doctor) {
      try {
        const appointmentData = {
          appointmentId: appointment.appointmentId,
          date: appointment.date,
          time: appointment.time,
          doctorName: appointment.doctorName || appointment.doctor.name,
          doctorSpecialization: appointment.doctorSpecialization || appointment.doctor.specialization,
          consultationFee: appointment.consultationFee,
          patientDetails: {
            name: appointment.patientDetails.name,
            email: appointment.patientDetails.email,
            phone: appointment.patientDetails.phone
          },
          doctorDetails: {
            name: appointment.doctor.name,
            specialization: appointment.doctor.specialization,
            location: appointment.doctor.location
          }
        };
        
        await notificationService.sendAppointmentCancellationNotifications(appointmentData);
      } catch (notificationError) {
        console.error('Error sending cancellation notifications:', notificationError);
        // Don't fail the status update if notifications fail
      }

      // Remove appointment from Patient and Doctor models when cancelled
      try {
        await Patient.findByIdAndUpdate(
          appointment.patient._id,
          { $pull: { appointments: appointment._id } }
        );

        await Doctor.findByIdAndUpdate(
          appointment.doctor._id,
          { $pull: { appointments: appointment._id } }
        );

        console.log('Appointment removed from Patient and Doctor records');
      } catch (updateError) {
        console.error('Error updating Patient/Doctor records:', updateError);
        // Don't fail the status update if this fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Complete appointment and make diet plan visible
const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { doctorNotes, prescription, dietPlan } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'completed',
        doctorNotes,
        prescription,
        'dietPlan.isVisible': true,
        'dietPlan.plan': dietPlan?.plan,
        'dietPlan.recommendations': dietPlan?.recommendations,
        'dietPlan.restrictions': dietPlan?.restrictions
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Clear AI plan for this patient since doctor appointment is completed
    await clearAIPlanOnDoctorCompletion(appointmentId);

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      appointment
    });

  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization location');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Reschedule appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    // Get the current appointment data before updating
    const oldAppointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate('doctor');

    if (!oldAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Store old date and time for notifications
    const oldDate = oldAppointment.date;
    const oldTime = oldAppointment.time;

    // Update the appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        date: new Date(date),
        time,
        status: 'pending' // Reset to pending for doctor confirmation
      },
      { new: true }
    ).populate('patient').populate('doctor');

    // Send rescheduling notification
    if (appointment.patient && appointment.doctor) {
      try {
        const appointmentData = {
          appointmentId: appointment.appointmentId,
          date: appointment.date,
          time: appointment.time,
          doctorName: appointment.doctorName || appointment.doctor.name,
          doctorSpecialization: appointment.doctorSpecialization || appointment.doctor.specialization,
          consultationFee: appointment.consultationFee,
          patientDetails: {
            name: appointment.patientDetails.name,
            email: appointment.patientDetails.email,
            phone: appointment.patientDetails.phone
          },
          doctorDetails: {
            name: appointment.doctor.name,
            specialization: appointment.doctor.specialization,
            location: appointment.doctor.location
          }
        };
        
        await notificationService.sendAppointmentRescheduleNotifications(
          appointmentData, 
          oldDate, 
          oldTime
        );
      } catch (notificationError) {
        console.error('Error sending rescheduling notifications:', notificationError);
        // Don't fail the reschedule if notifications fail
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cleanup function to remove cancelled appointments from Patient and Doctor models
const cleanupCancelledAppointments = async (req, res) => {
  try {
    // Find all cancelled appointments
    const cancelledAppointments = await Appointment.find({ status: 'cancelled' });
    
    let patientsUpdated = 0;
    let doctorsUpdated = 0;

    for (const appointment of cancelledAppointments) {
      // Remove from Patient model
      if (appointment.patient) {
        const patientResult = await Patient.findByIdAndUpdate(
          appointment.patient,
          { $pull: { appointments: appointment._id } },
          { new: true }
        );
        if (patientResult) patientsUpdated++;
      }

      // Remove from Doctor model  
      if (appointment.doctor) {
        const doctorResult = await Doctor.findByIdAndUpdate(
          appointment.doctor,
          { $pull: { appointments: appointment._id } },
          { new: true }
        );
        if (doctorResult) doctorsUpdated++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Cleanup completed successfully',
      stats: {
        cancelledAppointments: cancelledAppointments.length,
        patientsUpdated,
        doctorsUpdated
      }
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
};

// Delete appointment completely
const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find the appointment first to get patient and doctor info
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Send cancellation notification before deleting
    if (appointment.patient && appointment.doctor && appointment.status !== 'cancelled') {
      try {
        const appointmentData = {
          appointmentId: appointment.appointmentId,
          date: appointment.date,
          time: appointment.time,
          doctorName: appointment.doctorName || appointment.doctor.name,
          doctorSpecialization: appointment.doctorSpecialization || appointment.doctor.specialization,
          consultationFee: appointment.consultationFee,
          patientDetails: {
            name: appointment.patientDetails.name,
            email: appointment.patientDetails.email,
            phone: appointment.patientDetails.phone
          },
          doctorDetails: {
            name: appointment.doctor.name,
            specialization: appointment.doctor.specialization,
            location: appointment.doctor.location
          }
        };
        
        await notificationService.sendAppointmentCancellationNotifications(appointmentData);
      } catch (notificationError) {
        console.error('Error sending deletion notifications:', notificationError);
        // Don't fail the deletion if notifications fail
      }
    }

    // Remove appointment from Patient and Doctor models
    if (appointment.patient) {
      await Patient.findByIdAndUpdate(
        appointment.patient._id,
        { $pull: { appointments: appointment._id } }
      );
    }

    if (appointment.doctor) {
      await Doctor.findByIdAndUpdate(
        appointment.doctor._id,
        { $pull: { appointments: appointment._id } }
      );
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
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
};