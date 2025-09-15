const mongoose = require('mongoose');

// Schema for individual food recommendations
const foodRecommendationSchema = new mongoose.Schema({
  foodId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Food', 
    required: true 
  },
  quantity: { 
    type: String, 
    required: true 
  },
  frequency: { 
    type: String, 
    required: true 
  },
  timing: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'morning', 'evening', 'anytime'], 
    required: true 
  },
  notes: { 
    type: String 
  }
}, { _id: false });

// Schema for daily meal plans
const dailyMealSchema = new mongoose.Schema({
  day: { 
    type: String, 
    required: true 
  },
  breakfast: [foodRecommendationSchema],
  lunch: [foodRecommendationSchema],
  dinner: [foodRecommendationSchema],
  snacks: [foodRecommendationSchema]
}, { _id: false });

// Schema for lifestyle recommendations
const lifestyleRecommendationSchema = new mongoose.Schema({
  category: { 
    type: String, 
    enum: ['exercise', 'sleep', 'meditation', 'yoga', 'breathing', 'general'], 
    required: true 
  },
  recommendation: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String 
  },
  frequency: { 
    type: String 
  },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium' 
  }
}, { _id: false });

// Schema for herbal recommendations
const herbalRecommendationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  dosage: { 
    type: String, 
    required: true 
  },
  frequency: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: String 
  },
  notes: { 
    type: String 
  }
}, { _id: false });

// Main treatment plan schema
const treatmentPlanSchema = new mongoose.Schema({
  planId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor' 
  },
  consultation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment' 
  },
  planType: { 
    type: String, 
    enum: ['AI', 'Doctor', 'Hybrid'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'completed', 'revised', 'cancelled'], 
    default: 'draft' 
  },
  
  // Plan content
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  duration: { 
    type: String, 
    required: true 
  },
  
  // Medical information
  diagnosis: { 
    type: String 
  },
  symptoms: [{ 
    type: String 
  }],
  objectives: [{ 
    type: String 
  }],
  
  // Recommendations
  dietaryRecommendations: [foodRecommendationSchema],
  mealPlan: [dailyMealSchema],
  lifestyleRecommendations: [lifestyleRecommendationSchema],
  herbalRecommendations: [herbalRecommendationSchema],
  
  // Additional notes and instructions
  generalInstructions: { 
    type: String 
  },
  precautions: [{ 
    type: String 
  }],
  followUpInstructions: { 
    type: String 
  },
  
  // AI generation metadata
  aiGeneratedAt: { 
    type: Date 
  },
  aiModel: { 
    type: String 
  },
  aiConfidence: { 
    type: Number, 
    min: 0, 
    max: 1 
  },
  
  // Plan management
  version: { 
    type: Number, 
    default: 1 
  },
  previousVersions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TreatmentPlan' 
  }],
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor' 
  },
  approvedAt: { 
    type: Date 
  },
  
  // Patient feedback
  patientFeedback: {
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    comments: { 
      type: String 
    },
    adherence: { 
      type: Number, 
      min: 0, 
      max: 100 
    },
    submittedAt: { 
      type: Date 
    }
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
treatmentPlanSchema.index({ patient: 1, status: 1 });
treatmentPlanSchema.index({ doctor: 1, status: 1 });
treatmentPlanSchema.index({ planType: 1, status: 1 });
treatmentPlanSchema.index({ createdAt: -1 });

// Generate plan ID before saving
treatmentPlanSchema.pre('save', async function(next) {
  if (!this.planId) {
    const count = await this.constructor.countDocuments();
    this.planId = `TP${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for populated patient data
treatmentPlanSchema.virtual('patientInfo', {
  ref: 'Patient',
  localField: 'patient',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated doctor data
treatmentPlanSchema.virtual('doctorInfo', {
  ref: 'Doctor',
  localField: 'doctor',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated food data in recommendations
treatmentPlanSchema.virtual('populatedFoods', {
  ref: 'Food',
  localField: 'dietaryRecommendations.foodId',
  foreignField: '_id'
});

module.exports = mongoose.model('TreatmentPlan', treatmentPlanSchema);