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
  preferredCuisine: [String],
  surveyCompleted: { type: Boolean, default: false },
  previousPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPlan' },
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  currentPlan: {
    type: { type: String, enum: ['ai', 'doctor', 'none'], default: 'none' },
    planId: { type: mongoose.Schema.Types.ObjectId },
    isVisible: { type: Boolean, default: false },
    createdAt: { type: Date },
    lastModified: { type: Date },
    aiPlan: { type: mongoose.Schema.Types.Mixed } // Store AI generated plan data
  },
  // Consultation status tracking
  consultationStatus: {
    type: String,
    enum: ['none', 'consulting', 'completed'],
    default: 'none'
  },
  consultationStartedAt: { type: Date },
  consultationCompletedAt: { type: Date },
  // Prakriti Assessment Integration
  prakritiAssessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PrakritiAssessment' }],
  currentPrakriti: {
    assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrakritiAssessment' },
    primaryDosha: { type: String, enum: ['Vata', 'Pitta', 'Kapha'] },
    secondaryDosha: { type: String, enum: ['Vata', 'Pitta', 'Kapha'] },
    isDual: { type: Boolean, default: false },
    completedAt: { type: Date },
    isValid: { type: Boolean, default: true } // For future re-assessments
  },
  prakritiCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const Patient = User.discriminator('patient', PatientSchema);

module.exports = Patient;
