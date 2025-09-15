const mongoose = require('mongoose');

// Food item schema for each meal
const foodItemSchema = new mongoose.Schema({
  foodId: String,
  food_id: String,
  name: { type: String, required: true },
  vernacular_names: String,
  quantity: { type: String, default: '100g' },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  category: String,
  ayurvedic: {
    dosha_effects: {
      vata: String,
      pitta: String,
      kapha: String
    },
    rasa: String,
    guna: String,
    virya: String,
    vipaka: String
  },
  vitamins: mongoose.Schema.Types.Mixed,
  minerals: mongoose.Schema.Types.Mixed,
  health_tags: [String],
  medical_usage: String,
  contraindications: String,
  therapeutic_dosage: String,
  preparation_methods: [String]
}, { _id: false });

// Meal schema for each meal type
const mealSchema = new mongoose.Schema({
  breakfast: [foodItemSchema],
  lunch: [foodItemSchema],
  dinner: [foodItemSchema],
  snacks: [foodItemSchema]
}, { _id: false });

// Weekly meal plan schema
const weeklyMealPlanSchema = new mongoose.Schema({
  day1: mealSchema,
  day2: mealSchema,
  day3: mealSchema,
  day4: mealSchema,
  day5: mealSchema,
  day6: mealSchema,
  day7: mealSchema
}, { _id: false });

// Plan details schema
const planDetailsSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: { type: Number, default: 7 },
  notes: String,
  targetCalories: { type: Number, default: 2000 },
  dietaryRestrictions: [String],
  preferences: [String]
}, { _id: false });

// Nutrition summary schema
const nutritionSummarySchema = new mongoose.Schema({
  totalCalories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  doshaEffects: {
    vata: {
      increase: { type: Number, default: 0 },
      decrease: { type: Number, default: 0 }
    },
    pitta: {
      increase: { type: Number, default: 0 },
      decrease: { type: Number, default: 0 }
    },
    kapha: {
      increase: { type: Number, default: 0 },
      decrease: { type: Number, default: 0 }
    }
  }
}, { _id: false });

// Main meal plan schema
const mealPlanSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  title: { type: String, required: true },
  description: String,
  duration: { type: Number, default: 7 },
  targetCalories: { type: Number, default: 2000 },
  mealPlan: weeklyMealPlanSchema,
  planDetails: planDetailsSchema,
  nutritionSummary: nutritionSummarySchema,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  approved: { type: Boolean, default: false },
  planType: { type: String, enum: ['AI', 'Doctor', 'Manual'], default: 'Manual' }
}, { timestamps: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
