const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
  doctorName: { type: String, required: true },
  doctorSpecialization: { type: String },
  consultationFee: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  appointmentId: { type: String, unique: true, required: true },
  
  // Patient details
  patientDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String }, // Made optional since patients might not have phone in profile
    age: { type: String, required: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    emergencyContact: { type: String },
  },

  // Consultation details
  consultationDetails: {
    type: { 
      type: String, 
      required: true, 
      enum: ['general', 'followup', 'emergency', 'wellness'],
      default: 'general'
    },
    symptoms: { type: String, required: true },
    medicalHistory: { type: String },
    currentMedications: { type: String },
    allergies: { type: String },
    lifestyle: { type: String },
    weight: { type: String },
    height: { type: String },
  },

  // Payment information
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['card', 'upi', 'wallet'] 
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },

  // Appointment status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },

  // Diet plan (hidden until appointment is completed)
  dietPlan: {
    isVisible: { type: Boolean, default: false },
    plan: { type: String },
    recommendations: [{ type: String }],
    restrictions: [{ type: String }],
  },

  // Notes from doctor
  doctorNotes: { type: String },
  prescription: { type: String },
  
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
