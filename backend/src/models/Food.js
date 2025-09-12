const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  food_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name_en: { 
    type: String, 
    required: true 
  },
  vernacular_names: { 
    type: String 
  },
  category: { 
    type: String 
  },
  calories_kcal: { 
    type: Number 
  },
  protein_g: { 
    type: Number 
  },
  carbs_g: { 
    type: Number 
  },
  fats_g: { 
    type: Number 
  },
  fiber_g: { 
    type: Number 
  },
  vitamins: { 
    type: String 
  },
  minerals: { 
    type: String 
  },
  ayurveda_dosha_vata: { 
    type: String 
  },
  ayurveda_dosha_pitta: { 
    type: String 
  },
  ayurveda_dosha_kapha: { 
    type: String 
  },
  ayurveda_rasa: { 
    type: String 
  },
  ayurveda_guna: { 
    type: String 
  },
  ayurveda_virya: { 
    type: String 
  },
  ayurveda_vipaka: { 
    type: String 
  },
  health_tags: { 
    type: String 
  },
  medical_usage: { 
    type: String 
  },
  contraindications: { 
    type: String 
  },
  drug_interactions: { 
    type: String 
  },
  therapeutic_dosage: { 
    type: String 
  },
  preparation_methods: { 
    type: String 
  },
  restrictions: { 
    type: String 
  },
  growing_regions: { 
    type: String 
  },
  storage_shelf_life: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Create indexes for better query performance
FoodSchema.index({ food_id: 1 });
FoodSchema.index({ name_en: 1 });
FoodSchema.index({ category: 1 });
FoodSchema.index({ ayurveda_dosha_vata: 1, ayurveda_dosha_pitta: 1, ayurveda_dosha_kapha: 1 });

const Food = mongoose.model('Food', FoodSchema);

module.exports = Food;
