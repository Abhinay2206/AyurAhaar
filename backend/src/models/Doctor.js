const mongoose = require('mongoose');
const User = require('./UserBase');

const DoctorSchema = new mongoose.Schema({
  phone: { type: String },
  specialization: { type: String },
  licenseNumber: { type: String, required: true },
  experience: { type: Number },
  location: { type: String },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'patient' }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
}, { timestamps: true });

const Doctor = User.discriminator('doctor', DoctorSchema);

module.exports = Doctor;
