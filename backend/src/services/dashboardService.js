const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const MealPlan = require('../models/MealPlan');

class DashboardService {
  /**
   * Get comprehensive dashboard statistics for a doctor
   * @param {string} doctorId - The doctor's ID
   * @param {Object} options - Additional options for filtering
   * @returns {Object} Dashboard statistics
   */
  async getDoctorStats(doctorId, options = {}) {
    try {
      const { dateRange } = options;
      
      // Define date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      // Custom date range if provided
      let dateFilter = {};
      if (dateRange) {
        dateFilter = {
          date: { 
            $gte: new Date(dateRange.start), 
            $lt: new Date(dateRange.end) 
          }
        };
      }

      // Parallel queries for performance
      const [
        doctorAppointments,
        todayAppointments,
        weeklyAppointments,
        monthlyAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        activeMealPlans,
        pendingMealPlans,
        aiGeneratedPlans,
        doctorCreatedPlans
      ] = await Promise.all([
        // Get all appointments for this doctor to count unique patients
        Appointment.find({ doctor: doctorId }, 'patient patientDetails').lean(),
        
        // Today's appointments
        Appointment.countDocuments({
          doctor: doctorId,
          date: { $gte: startOfDay, $lt: endOfDay },
          status: { $in: ['confirmed', 'pending'] }
        }),
        
        // This week's appointments
        Appointment.countDocuments({
          doctor: doctorId,
          date: { 
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()),
            $lt: endOfDay
          }
        }),
        
        // This month's appointments
        Appointment.countDocuments({
          doctor: doctorId,
          date: { 
            $gte: new Date(today.getFullYear(), today.getMonth(), 1),
            $lt: new Date(today.getFullYear(), today.getMonth() + 1, 1)
          }
        }),
        
        // Pending appointments
        Appointment.countDocuments({
          doctor: doctorId,
          status: 'pending'
        }),
        
        // Completed appointments
        Appointment.countDocuments({
          doctor: doctorId,
          status: 'completed'
        }),
        
        // Cancelled appointments
        Appointment.countDocuments({
          doctor: doctorId,
          status: 'cancelled'
        }),
        
        // Active meal plans (approved)
        MealPlan.countDocuments({
          doctor: doctorId,
          approved: true
        }),
        
        // Pending meal plans
        MealPlan.countDocuments({
          doctor: doctorId,
          approved: false
        }),
        
        // AI generated plans
        MealPlan.countDocuments({
          doctor: doctorId,
          planType: 'AI'
        }),
        
        // Doctor created plans
        MealPlan.countDocuments({
          doctor: doctorId,
          planType: 'Doctor'
        })
      ]);

      // Count unique patients (both registered and unregistered)
      const uniquePatients = new Set();
      let registeredPatientsCount = 0;

      for (const appointment of doctorAppointments) {
        if (appointment.patient) {
          // Registered patient
          const patientId = appointment.patient.toString();
          uniquePatients.add(patientId);
          registeredPatientsCount++;
        } else if (appointment.patientDetails && appointment.patientDetails.email) {
          // Unregistered patient - use email as unique identifier
          uniquePatients.add(`unregistered_${appointment.patientDetails.email}`);
        }
      }

      // Get count of unique registered patients
      const registeredPatientIds = doctorAppointments
        .filter(apt => apt.patient)
        .map(apt => apt.patient);
      
      const uniqueRegisteredPatients = [...new Set(registeredPatientIds.map(id => id.toString()))];
      const actualRegisteredCount = uniqueRegisteredPatients.length;

      return {
        patients: {
          total: uniquePatients.size,
          registered: actualRegisteredCount,
          unregistered: uniquePatients.size - actualRegisteredCount,
          new: 0 // Could be calculated based on first appointment date
        },
        appointments: {
          today: todayAppointments,
          thisWeek: weeklyAppointments,
          thisMonth: monthlyAppointments,
          pending: pendingAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          total: pendingAppointments + completedAppointments + cancelledAppointments
        },
        mealPlans: {
          active: activeMealPlans,
          pending: pendingMealPlans,
          aiGenerated: aiGeneratedPlans,
          doctorCreated: doctorCreatedPlans,
          total: activeMealPlans + pendingMealPlans
        }
      };
    } catch (error) {
      throw new Error(`Failed to get doctor stats: ${error.message}`);
    }
  }

  /**
   * Get recent activities for dashboard
   * @param {string} doctorId - The doctor's ID
   * @param {number} limit - Number of items to return
   * @returns {Object} Recent activities
   */
  async getRecentActivities(doctorId, limit = 5) {
    try {
      // Get recent unique patients
      const recentPatients = await this._getRecentPatients(doctorId, limit);
      
      // Get today's appointments
      const recentAppointments = await this._getTodayAppointments(doctorId, limit);
      
      // Get recent meal plans
      const recentMealPlans = await this._getRecentMealPlans(doctorId, limit);

      return {
        recentPatients,
        recentAppointments,
        recentMealPlans
      };
    } catch (error) {
      throw new Error(`Failed to get recent activities: ${error.message}`);
    }
  }

  /**
   * Search across patients and appointments
   * @param {string} doctorId - The doctor's ID
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @returns {Object} Search results
   */
  async searchDashboard(doctorId, query, limit = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return { patients: [], appointments: [] };
      }

      const searchRegex = new RegExp(query.trim(), 'i');

      // Check if query looks like a MongoDB ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(query.trim());

      // Search patients and appointments in parallel
      const [patients, appointments, patientById] = await Promise.all([
        this._searchPatients(doctorId, searchRegex, limit),
        this._searchAppointments(doctorId, searchRegex, limit),
        // If query looks like an ObjectId, search by patient ID directly
        isObjectId ? this._searchPatientById(doctorId, query.trim(), limit) : Promise.resolve([])
      ]);

      // Combine and deduplicate patient results
      const allPatients = [...patients];
      if (patientById.length > 0) {
        const existingIds = new Set(patients.map(p => p.id.toString()));
        for (const patient of patientById) {
          if (!existingIds.has(patient.id.toString())) {
            allPatients.push(patient);
          }
        }
      }

      return { 
        patients: allPatients.slice(0, limit), 
        appointments: appointments.slice(0, limit) 
      };
    } catch (error) {
      throw new Error(`Failed to search dashboard: ${error.message}`);
    }
  }

  /**
   * Search for patient by their database ID
   * @param {string} doctorId - The doctor's ID
   * @param {string} patientId - The patient's ObjectId
   * @param {number} limit - Number of results to return
   * @returns {Array} Patient results
   */
  async _searchPatientById(doctorId, patientId, limit) {
    try {
      // First check if this patient has any appointments with this doctor
      const hasAppointment = await Appointment.findOne({ 
        doctor: doctorId, 
        patient: patientId 
      });

      if (!hasAppointment) {
        return []; // Patient not associated with this doctor
      }

      // Get the patient details
      const patient = await Patient.findById(patientId);
      if (!patient) {
        // Patient ID exists in appointment but no Patient document
        // Return info from appointment patientDetails
        return [{
          id: hasAppointment._id,
          name: hasAppointment.patientDetails.name,
          email: hasAppointment.patientDetails.email,
          phone: hasAppointment.patientDetails.phone,
          age: hasAppointment.patientDetails.age,
          constitution: 'Not assessed',
          type: 'patient',
          isRegistered: false,
          searchType: 'id_match_unregistered'
        }];
      }

      return [{
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        constitution: patient.currentPrakriti?.primaryDosha || 'Not assessed',
        type: 'patient',
        isRegistered: true,
        searchType: 'id_match'
      }];
    } catch (error) {
      console.error('Error searching patient by ID:', error);
      return [];
    }
  }

  // Private helper methods

  async _getRecentPatients(doctorId, limit) {
    try {
      // Get recent appointments for this doctor
      const recentAppointments = await Appointment.find({ doctor: doctorId })
        .populate('patient', 'name email phone age gender currentPrakriti')
        .sort({ createdAt: -1 })
        .limit(limit * 3); // Get more to ensure unique patients after filtering

      const uniquePatientsMap = new Map();
      const recentPatients = [];
      
      for (const appointment of recentAppointments) {
        let patientKey, patientData;

        if (appointment.patient && appointment.patient._id) {
          // Registered patient
          patientKey = appointment.patient._id.toString();
          patientData = {
            id: appointment.patient._id,
            name: appointment.patient.name,
            age: appointment.patient.age,
            constitution: appointment.patient.currentPrakriti?.primaryDosha || 'Not assessed',
            condition: appointment.consultationDetails?.symptoms || 'General consultation',
            lastVisit: appointment.date.toLocaleDateString(),
            isRegistered: true,
            appointmentStatus: appointment.status
          };
        } else if (appointment.patientDetails) {
          // Non-registered patient (appointment only)
          patientKey = `unregistered_${appointment.patientDetails.email}`;
          patientData = {
            id: appointment._id, // Use appointment ID for non-registered patients
            name: appointment.patientDetails.name,
            age: appointment.patientDetails.age,
            constitution: 'Not assessed',
            condition: appointment.consultationDetails?.symptoms || 'General consultation',
            lastVisit: appointment.date.toLocaleDateString(),
            isRegistered: false,
            appointmentStatus: appointment.status
          };
        } else {
          // Skip appointments without patient data
          continue;
        }

        if (!uniquePatientsMap.has(patientKey)) {
          uniquePatientsMap.set(patientKey, true);
          recentPatients.push(patientData);
          
          if (recentPatients.length >= limit) break;
        }
      }

      return recentPatients;
    } catch (error) {
      console.error('Error getting recent patients:', error);
      return [];
    }
  }

  async _getTodayAppointments(doctorId, limit) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lt: endOfDay }
    })
    .populate('patient', 'name')
    .sort({ time: 1 })
    .limit(limit);

    return todayAppointments.map(appointment => ({
      id: appointment._id,
      time: appointment.time,
      patient: appointment.patient?.name || appointment.patientDetails?.name,
      type: appointment.consultationDetails?.type || 'General',
      duration: '30 mins',
      status: appointment.status
    }));
  }

  async _getRecentMealPlans(doctorId, limit) {
    const recentMealPlans = await MealPlan.find({ doctor: doctorId })
      .populate('patient', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    return recentMealPlans.map(plan => ({
      id: plan._id,
      patient: plan.patient?.name || 'Unknown Patient',
      planType: plan.planType,
      status: plan.approved ? 'active' : 'pending approval',
      created: plan.createdAt.toLocaleDateString(),
      progress: plan.approved ? Math.floor(Math.random() * 40) + 60 : 0
    }));
  }

  async _searchPatients(doctorId, searchRegex, limit) {
    try {
      // Search strategy:
      // 1. Find appointments for this doctor
      // 2. Get unique patient IDs from those appointments
      // 3. Search in Patient collection using those IDs and search criteria
      // 4. Also search in appointment patient details for cases where patient might not be registered

      // First, get all patient IDs that have appointments with this doctor
      const doctorAppointments = await Appointment.find({ doctor: doctorId }).distinct('patient');
      const validPatientIds = doctorAppointments.filter(id => id != null);

      // Search in the Patient collection directly for registered patients
      const registeredPatients = await Patient.find({
        _id: { $in: validPatientIds },
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      })
      .limit(limit)
      .lean();

      // Also search in appointment patient details for non-registered patients or additional matches
      const appointmentMatches = await Appointment.find({
        doctor: doctorId,
        $or: [
          { 'patientDetails.name': searchRegex },
          { 'patientDetails.email': searchRegex },
          { 'patientDetails.phone': searchRegex }
        ]
      })
      .populate('patient', 'name email phone age gender currentPrakriti')
      .sort({ createdAt: -1 })
      .limit(limit * 2); // Get more for deduplication

      // Combine and deduplicate results
      const uniquePatientsMap = new Map();
      const patients = [];

      // Add registered patients first
      for (const patient of registeredPatients) {
        const patientKey = patient._id.toString();
        if (!uniquePatientsMap.has(patientKey)) {
          uniquePatientsMap.set(patientKey, true);
          patients.push({
            id: patient._id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            age: patient.age,
            constitution: patient.currentPrakriti?.primaryDosha || 'Not assessed',
            type: 'patient',
            isRegistered: true
          });
        }
      }

      // Add appointment-based matches (for unregistered patients or additional info)
      for (const appointment of appointmentMatches) {
        let patientKey;
        
        if (appointment.patient && appointment.patient._id) {
          // Registered patient
          patientKey = appointment.patient._id.toString();
          if (!uniquePatientsMap.has(patientKey)) {
            uniquePatientsMap.set(patientKey, true);
            patients.push({
              id: appointment.patient._id,
              name: appointment.patient.name,
              email: appointment.patient.email,
              phone: appointment.patient.phone,
              age: appointment.patient.age,
              constitution: appointment.patient.currentPrakriti?.primaryDosha || 'Not assessed',
              type: 'patient',
              isRegistered: true
            });
          }
        } else if (appointment.patientDetails) {
          // Non-registered patient (only appointment details)
          patientKey = `unregistered_${appointment.patientDetails.email}`;
          if (!uniquePatientsMap.has(patientKey)) {
            uniquePatientsMap.set(patientKey, true);
            patients.push({
              id: appointment._id, // Use appointment ID for non-registered patients
              name: appointment.patientDetails.name,
              email: appointment.patientDetails.email,
              phone: appointment.patientDetails.phone,
              age: appointment.patientDetails.age,
              constitution: 'Not assessed',
              type: 'patient',
              isRegistered: false
            });
          }
        }
      }

      return patients.slice(0, limit);
    } catch (error) {
      console.error('Error searching patients:', error);
      return [];
    }
  }

  async _searchAppointments(doctorId, searchRegex, limit) {
    try {
      // Enhanced appointment search with multiple criteria based on actual data structure
      const appointments = await Appointment.find({
        doctor: doctorId,
        $or: [
          { 'patientDetails.name': searchRegex },
          { 'patientDetails.email': searchRegex },
          { 'patientDetails.phone': searchRegex },
          { appointmentId: searchRegex },
          { status: searchRegex },
          { 'consultationDetails.type': searchRegex },
          { 'consultationDetails.symptoms': searchRegex },
          { 'consultationDetails.medicalHistory': searchRegex },
          { 'consultationDetails.allergies': searchRegex },
          { 'consultationDetails.lifestyle': searchRegex },
          { doctorName: searchRegex },
          { doctorSpecialization: searchRegex }
        ]
      })
      .populate('patient', 'name email phone')
      .sort({ date: -1 })
      .limit(limit);

      return appointments.map(appointment => ({
        id: appointment._id,
        appointmentId: appointment.appointmentId,
        patientName: appointment.patient?.name || appointment.patientDetails.name,
        patientEmail: appointment.patient?.email || appointment.patientDetails.email,
        patientPhone: appointment.patient?.phone || appointment.patientDetails.phone,
        patientAge: appointment.patientDetails.age,
        patientGender: appointment.patientDetails.gender,
        date: appointment.date.toLocaleDateString(),
        time: appointment.time,
        status: appointment.status,
        consultationType: appointment.consultationDetails?.type || 'general',
        symptoms: appointment.consultationDetails?.symptoms,
        medicalHistory: appointment.consultationDetails?.medicalHistory,
        allergies: appointment.consultationDetails?.allergies,
        lifestyle: appointment.consultationDetails?.lifestyle,
        doctorName: appointment.doctorName,
        doctorSpecialization: appointment.doctorSpecialization,
        consultationFee: appointment.consultationFee,
        paymentStatus: appointment.paymentStatus,
        type: 'appointment',
        isPatientRegistered: !!appointment.patient
      }));
    } catch (error) {
      console.error('Error searching appointments:', error);
      return [];
    }
  }
}

module.exports = new DashboardService();