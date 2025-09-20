const mongoose = require('mongoose');
const User = require('./UserBase');

const DoctorSchema = new mongoose.Schema({
  phone: { type: String },
  specialization: { type: String },
  licenseNumber: { type: String, required: true },
  experience: { type: String }, // Changed to String to support "15 years" format
  qualification: { type: String },
  clinic: { type: String },
  location: { type: String },
  consultationFee: { type: Number, default: 500 },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'patient' }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  
  // Settings fields
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    appointmentReminders: { type: Boolean, default: true },
    newPatientAlerts: { type: Boolean, default: true },
    treatmentUpdates: { type: Boolean, default: false },
    systemUpdates: { type: Boolean, default: true }
  },
  
  preferences: {
    language: { type: String, default: 'english' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    currency: { type: String, default: 'INR' },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    consultationDuration: { type: Number, default: 30 }
  },
  
  // Security settings
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  tempTwoFactorSecret: { type: String },
  lastPasswordChange: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  sessionTimeout: { type: Number, default: 30 }
}, { timestamps: true });

const Doctor = User.discriminator('doctor', DoctorSchema);

module.exports = Doctor;
