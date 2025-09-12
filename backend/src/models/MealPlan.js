const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  day: String,
  breakfast: String,
  lunch: String,
  dinner: String,
  snacks: String,
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' }, // optional if AI generated
  planType: { type: String, enum: ['AI', 'Doctor'], required: true },
  meals: [mealSchema],
  approved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
