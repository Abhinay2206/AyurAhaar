const mongoose = require('mongoose');

// Schema for storing the 10 Prakriti assessment questions
const PrakritiQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true, min: 1, max: 10 },
  questionText: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'body_build_weight',
      'skin_type',
      'hair',
      'appetite_digestion',
      'sleep',
      'temperature_tolerance',
      'energy_activity',
      'mind_emotions',
      'memory_learning',
      'food_preferences'
    ]
  },
  options: [{
    optionText: { type: String, required: true },
    vataScore: { type: Number, required: true, min: 0, max: 3 },
    pittaScore: { type: Number, required: true, min: 0, max: 3 },
    kaphaScore: { type: Number, required: true, min: 0, max: 3 }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Schema for individual patient's response to a question
const PrakritiResponseSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrakritiAssessment', required: true },
  questionNumber: { type: Number, required: true, min: 1, max: 10 },
  selectedOption: { type: Number, required: true, min: 0, max: 2 }, // Index of selected option
  vataScore: { type: Number, required: true, min: 0, max: 3 },
  pittaScore: { type: Number, required: true, min: 0, max: 3 },
  kaphaScore: { type: Number, required: true, min: 0, max: 3 }
}, { timestamps: true });

// Schema for complete Prakriti assessment result
const PrakritiAssessmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PrakritiResponse' }],
  totalScores: {
    vata: { type: Number, required: true, min: 0, max: 30 },
    pitta: { type: Number, required: true, min: 0, max: 30 },
    kapha: { type: Number, required: true, min: 0, max: 30 }
  },
  prakritiType: {
    primary: { 
      type: String, 
      required: true, 
      enum: ['Vata', 'Pitta', 'Kapha'] 
    },
    secondary: { 
      type: String, 
      enum: ['Vata', 'Pitta', 'Kapha', null],
      default: null 
    },
    isDual: { type: Boolean, default: false },
    percentages: {
      vata: { type: Number, min: 0, max: 100 },
      pitta: { type: Number, min: 0, max: 100 },
      kapha: { type: Number, min: 0, max: 100 }
    }
  },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  version: { type: Number, default: 1 } // For future assessment versions
}, { timestamps: true });

// Indexes for better query performance
PrakritiResponseSchema.index({ patientId: 1, assessmentId: 1 });
PrakritiAssessmentSchema.index({ patientId: 1, createdAt: -1 });

// Instance method to calculate prakriti type
PrakritiAssessmentSchema.methods.calculatePrakritiType = function() {
  const { vata, pitta, kapha } = this.totalScores;
  const total = vata + pitta + kapha;
  
  // Calculate percentages
  this.prakritiType.percentages = {
    vata: Math.round((vata / total) * 100),
    pitta: Math.round((pitta / total) * 100),
    kapha: Math.round((kapha / total) * 100)
  };
  
  // Determine primary dosha
  const scores = [
    { name: 'Vata', score: vata },
    { name: 'Pitta', score: pitta },
    { name: 'Kapha', score: kapha }
  ].sort((a, b) => b.score - a.score);
  
  this.prakritiType.primary = scores[0].name;
  
  // Check for dual prakriti (difference between top two scores is less than 20%)
  const primaryPercent = this.prakritiType.percentages[scores[0].name.toLowerCase()];
  const secondaryPercent = this.prakritiType.percentages[scores[1].name.toLowerCase()];
  
  if (Math.abs(primaryPercent - secondaryPercent) <= 10) {
    this.prakritiType.secondary = scores[1].name;
    this.prakritiType.isDual = true;
  }
  
  return this.prakritiType;
};

// Static method to get default questions
PrakritiQuestionSchema.statics.getDefaultQuestions = function() {
  return [
    {
      questionNumber: 1,
      questionText: "How would you describe your body build?",
      category: "body_build_weight",
      options: [
        {
          optionText: "Thin, lean, and find it hard to gain weight",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Medium build, gain/lose weight fairly easily",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Broad/stocky build, gain weight easily and slowly lose",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 2,
      questionText: "How is your skin usually?",
      category: "skin_type",
      options: [
        {
          optionText: "Dry, rough, cool",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Warm, reddish, sometimes oily, prone to rashes",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Smooth, pale, soft, oily, cool",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 3,
      questionText: "How would you describe your hair?",
      category: "hair",
      options: [
        {
          optionText: "Dry, frizzy, thin",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Straight, fine, prone to early greying or thinning",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Thick, wavy, oily, strong",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 4,
      questionText: "Which describes you best?",
      category: "appetite_digestion",
      options: [
        {
          optionText: "Variable appetite, sometimes hungry, sometimes not",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Strong appetite, feel hungry quickly, can't skip meals",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Slow digestion, not very hungry, heavy after meals",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 5,
      questionText: "How is your sleep usually?",
      category: "sleep",
      options: [
        {
          optionText: "Light, disturbed, less hours",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Medium, 6–8 hours, can wake up easily",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Heavy, long, find it hard to wake up",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 6,
      questionText: "How do you feel in different weather?",
      category: "temperature_tolerance",
      options: [
        {
          optionText: "Sensitive to cold, prefer warmth",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Sensitive to heat, prefer cool climate",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Comfortable mostly, dislike dampness/humidity",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 7,
      questionText: "How would you describe your energy level?",
      category: "energy_activity",
      options: [
        {
          optionText: "Energetic in bursts, but tire quickly",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Consistent, strong energy but can burn out",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Steady, long-lasting stamina, but move slowly",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 8,
      questionText: "How do you usually react?",
      category: "mind_emotions",
      options: [
        {
          optionText: "Anxious, worry easily, quick to change mood",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Intense, focused, sometimes angry or impatient",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Calm, steady, forgiving, slow to anger",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 9,
      questionText: "Which suits you best?",
      category: "memory_learning",
      options: [
        {
          optionText: "Quick to learn but forget easily",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Sharp memory, analytical",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Learn slowly but retain long-term",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    },
    {
      questionNumber: 10,
      questionText: "Which foods do you like naturally?",
      category: "food_preferences",
      options: [
        {
          optionText: "Warm, oily, grounding foods",
          vataScore: 3,
          pittaScore: 0,
          kaphaScore: 0
        },
        {
          optionText: "Cooling, light, less spicy foods",
          vataScore: 0,
          pittaScore: 3,
          kaphaScore: 0
        },
        {
          optionText: "Light, dry foods, spicy things to stimulate digestion",
          vataScore: 0,
          pittaScore: 0,
          kaphaScore: 3
        }
      ]
    }
  ];
};

const PrakritiQuestion = mongoose.model('PrakritiQuestion', PrakritiQuestionSchema);
const PrakritiResponse = mongoose.model('PrakritiResponse', PrakritiResponseSchema);
const PrakritiAssessment = mongoose.model('PrakritiAssessment', PrakritiAssessmentSchema);

module.exports = {
  PrakritiQuestion,
  PrakritiResponse,
  PrakritiAssessment
};