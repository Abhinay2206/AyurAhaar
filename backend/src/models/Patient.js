const mongoose = require('mongoose');
const User = require('./UserBase');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  lifestyle: { type: String },
  allergies: [String],
  healthConditions: [String],
  surveyCompleted: { type: Boolean, default: false },
  previousPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan' },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  currentPlan: {
    type: { type: String, enum: ['ai', 'doctor', 'none'], default: 'none' },
    planId: { type: mongoose.Schema.Types.ObjectId },
    isVisible: { type: Boolean, default: false },
    createdAt: { type: Date },
    lastModified: { type: Date }
  },
}, { timestamps: true });

const Patient = User.discriminator('patient', PatientSchema);

module.exports = Patient;
