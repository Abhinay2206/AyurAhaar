import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ApiService from '../../services/api';

const MealPlanCreationScreen = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const patientId = urlParams.get('patientId');

  console.log('🌍 Location:', location);
  console.log('🔗 URL Params:', location.search);
  console.log('🆔 Extracted Patient ID:', patientId);

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('day1');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [draggedFood, setDraggedFood] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [existingPlan, setExistingPlan] = useState(null);
  const [showOverrideConfirmation, setShowOverrideConfirmation] = useState(false);
  
  // Advanced meal plan structure with nutrition tracking
  const [mealPlan, setMealPlan] = useState({
    day1: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    day2: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    day3: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    day4: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    day5: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    day6: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    day7: { breakfast: [], lunch: [], dinner: [], snacks: [] }
  });

  const [planDetails, setPlanDetails] = useState({
    title: '',
    description: '',
    duration: 7,
    notes: '',
    targetCalories: 2000,
    dietaryRestrictions: [],
    preferences: []
  });

  const [nutritionSummary, setNutritionSummary] = useState({
    totalCalories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    doshaEffects: {
      vata: { increase: 0, decrease: 0 },
      pitta: { increase: 0, decrease: 0 },
      kapha: { increase: 0, decrease: 0 }
    }
  });

  // Meal plan templates
  const mealTemplates = {
    'weight-loss': {
      name: 'Weight Loss Plan',
      description: 'Low-calorie, high-protein meals for healthy weight loss',
      targetCalories: 1500,
      meals: {
        breakfast: ['Oats with berries', 'Green tea', 'Almonds'],
        lunch: ['Quinoa salad', 'Grilled vegetables', 'Lentil soup'],
        dinner: ['Steamed vegetables', 'Brown rice', 'Dal'],
        snacks: ['Cucumber slices', 'Herbal tea']
      }
    },
    'muscle-gain': {
      name: 'Muscle Building Plan',
      description: 'High-protein, nutrient-dense meals for muscle growth',
      targetCalories: 2500,
      meals: {
        breakfast: ['Protein smoothie', 'Whole grain toast', 'Nuts'],
        lunch: ['Chickpea curry', 'Quinoa', 'Mixed vegetables'],
        dinner: ['Paneer curry', 'Brown rice', 'Spinach'],
        snacks: ['Protein shake', 'Dates']
      }
    },
    'diabetic': {
      name: 'Diabetic-Friendly Plan',
      description: 'Low glycemic index foods for blood sugar management',
      targetCalories: 1800,
      meals: {
        breakfast: ['Steel-cut oats', 'Cinnamon', 'Walnuts'],
        lunch: ['Vegetable curry', 'Cauliflower rice', 'Bitter gourd'],
        dinner: ['Methi leaves', 'Roti', 'Cucumber salad'],
        snacks: ['Roasted chickpeas', 'Green tea']
      }
    },
    'heart-healthy': {
      name: 'Heart-Healthy Plan',
      description: 'Low sodium, omega-3 rich foods for cardiovascular health',
      targetCalories: 2000,
      meals: {
        breakfast: ['Flax seed porridge', 'Fresh fruits', 'Green tea'],
        lunch: ['Fish curry', 'Brown rice', 'Steamed broccoli'],
        dinner: ['Lentil soup', 'Quinoa', 'Mixed greens'],
        snacks: ['Nuts', 'Herbal tea']
      }
    }
  };

  const days = [
    { key: 'day1', label: 'Monday', short: 'Mon' },
    { key: 'day2', label: 'Tuesday', short: 'Tue' },
    { key: 'day3', label: 'Wednesday', short: 'Wed' },
    { key: 'day4', label: 'Thursday', short: 'Thu' },
    { key: 'day5', label: 'Friday', short: 'Fri' },
    { key: 'day6', label: 'Saturday', short: 'Sat' },
    { key: 'day7', label: 'Sunday', short: 'Sun' }
  ];

  const meals = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: '#FEF3C7' },
    { key: 'lunch', label: 'Lunch', icon: '☀️', color: '#FED7AA' },
    { key: 'dinner', label: 'Dinner', icon: '🌙', color: '#DDD6FE' },
    { key: 'snacks', label: 'Snacks', icon: '🍎', color: '#D1FAE5' }
  ];

  const dietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
    'Low-Sodium', 'Low-Sugar', 'Keto', 'Paleo'
  ];

  useEffect(() => {
    if (patientId) {
      fetchPatient();
      checkExistingPlan();
    }
    fetchFoods();
    fetchCategories();
  }, [patientId]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchFoods();
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    calculateNutrition();
  }, [mealPlan]);

  const fetchPatient = async () => {
    console.log('👤 Fetching patient with ID:', patientId);
    try {
      const response = await ApiService.getPatientById(patientId);
      console.log('✅ Patient API Response:', response);
      
      const patientData = response.data || response;
      console.log('👤 Setting patient data:', patientData);
      
      setPatient(patientData);
      setPlanDetails(prev => ({
        ...prev,
        title: `7-Day Meal Plan for ${patientData.name || 'Patient'}`
      }));
      
      console.log('✅ Patient set successfully');
    } catch (error) {
      console.error('❌ Error fetching patient:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Error fetching patient information.';
      
      if (error.message) {
        if (error.message.includes('404')) {
          errorMessage = `Patient not found. The patient ID "${patientId}" does not exist in the system.`;
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to view this patient.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error while fetching patient. Please try again later.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }
      
      alert(`❌ ${errorMessage}\n\nDetails: ${error.message || 'Unknown error'}\n\nPlease check the patient ID in the URL or contact support.`);
    }
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      // Only add search filter if searchTerm is not empty
      if (searchTerm && searchTerm.trim() !== '') {
        filters.search = searchTerm.trim();
      }
      
      // Only add category filter if it's not 'all'
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
        // Increase limit when filtering by category to get all foods
        filters.limit = 100;
      } else if (!searchTerm) {
        // Default limit when no filters
        filters.limit = 20;
      } else {
        // Higher limit for search results
        filters.limit = 50;
      }
      
      console.log('🔍 Fetching foods with filters:', filters);
      console.log('📋 Selected category:', selectedCategory);
      console.log('🔤 Search term:', `"${searchTerm}"`);
      
      const response = await ApiService.getAllFoods(filters);
      console.log('📦 Fetched foods response:', response);
      
      // Handle the actual API response structure
      const foodsData = response.data?.foods || response.foods || [];
      console.log('🍽️ Foods data length:', foodsData.length);
      console.log('🍽️ First few foods:', foodsData.slice(0, 3));
      
      if (foodsData.length === 0 && (searchTerm || selectedCategory !== 'all')) {
        console.log('⚠️ No foods found for current filters');
      }
      
      setFoods(foodsData);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching food categories...');
      const response = await ApiService.getFoodCategories();
      console.log('📦 Categories response:', response);
      
      const categoriesData = response.data?.data || response.data?.categories || response.categories || response.data || [];
      console.log('📋 Categories data:', categoriesData);
      
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        // Use fallback categories from database structure
        setCategories([
          'Animal-based', 
          'Cereal', 
          'Vegetable', 
          'Fruit', 
          'Legume', 
          'Nuts & Oils', 
          'Herbs', 
          'Spices', 
          'Dairy'
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Use default categories based on the API response we saw
      setCategories([
        'Animal-based', 
        'Cereal', 
        'Vegetable', 
        'Fruit', 
        'Legume', 
        'Nuts & Oils', 
        'Herbs', 
        'Spices', 
        'Dairy'
      ]);
    }
  };

  const checkExistingPlan = async () => {
    if (!patientId) return;
    try {
      const response = await ApiService.getPatientMealPlans(patientId);
      const plans = response.data?.plans || response.plans || [];
      if (plans.length > 0) {
        setExistingPlan(plans[0]); // Get the most recent plan
      }
    } catch (error) {
      console.error('Error checking existing plans:', error);
    }
  };

  const calculateNutrition = () => {
    let totalCalories = 0, protein = 0, carbs = 0, fats = 0, fiber = 0;
    let vataIncrease = 0, vataDecrease = 0;
    let pittaIncrease = 0, pittaDecrease = 0;
    let kaphaIncrease = 0, kaphaDecrease = 0;
    
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(mealFoods => {
        mealFoods.forEach(food => {
          // Handle both old and new nutrition data structure
          totalCalories += food.calories || food.energy_kcal || 0;
          protein += food.protein || food.protein_g || 0;
          carbs += food.carbs || food.carbohydrate_g || 0;
          fats += food.fats || food.fat_g || 0;
          fiber += food.fiber || food.fiber_g || 0;
          
          // Count Ayurvedic dosha effects - handle both nested and direct database fields
          const vataEffect = food.ayurvedic?.dosha_effects?.vata || food.ayurveda_dosha_vata;
          const pittaEffect = food.ayurvedic?.dosha_effects?.pitta || food.ayurveda_dosha_pitta;
          const kaphaEffect = food.ayurvedic?.dosha_effects?.kapha || food.ayurveda_dosha_kapha;
          
          if (vataEffect === 'Increase') vataIncrease++;
          else if (vataEffect === 'Decrease') vataDecrease++;
          
          if (pittaEffect === 'Increase') pittaIncrease++;
          else if (pittaEffect === 'Decrease') pittaDecrease++;
          
          if (kaphaEffect === 'Increase') kaphaIncrease++;
          else if (kaphaEffect === 'Decrease') kaphaDecrease++;
        });
      });
    });

    setNutritionSummary({
      totalCalories: Math.round(totalCalories / 7), // Daily average
      protein: Math.round(protein / 7),
      carbs: Math.round(carbs / 7),
      fats: Math.round(fats / 7),
      fiber: Math.round(fiber / 7),
      doshaEffects: {
        vata: { increase: vataIncrease, decrease: vataDecrease },
        pitta: { increase: pittaIncrease, decrease: pittaDecrease },
        kapha: { increase: kaphaIncrease, decrease: kaphaDecrease }
      }
    });
    
    console.log('📊 Nutrition calculated:', {
      totalCalories: Math.round(totalCalories / 7),
      protein: Math.round(protein / 7),
      carbs: Math.round(carbs / 7),
      fats: Math.round(fats / 7),
      fiber: Math.round(fiber / 7)
    });
  };

  const addFoodToMeal = (food, dayKey = selectedDay, mealKey = selectedMeal) => {
    console.log('🍎 Adding food to meal:', food);
    
    // Map the nutrition data from the actual food object structure
    const nutritionData = {
      foodId: food._id,
      food_id: food.food_id,
      name: food.name_en || food.name,
      vernacular_names: food.vernacular_names,
      quantity: '100g', // Default quantity
      calories: food.calories || food['calories(kcal)'] || food.energy_kcal || 0,
      protein: food.protein || food['protein(g)'] || food.protein_g || 0,
      carbs: food.carbs || food['carbs(g)'] || food.carbohydrate_g || 0,
      fats: food.fats || food['fats(g)'] || food.fat_g || 0,
      fiber: food.fiber || food['fiber(g)'] || food.fiber_g || 0,
      category: food.category,
      
      // Ayurvedic properties
      ayurvedic: {
        dosha_effects: {
          vata: food.ayurveda_dosha_vata || food['ayurveda_dosha_vata'],
          pitta: food.ayurveda_dosha_pitta || food['ayurveda_dosha_pitta'],
          kapha: food.ayurveda_dosha_kapha || food['ayurveda_dosha_kapha']
        },
        rasa: food.ayurveda_rasa || food['ayurveda_rasa'],
        guna: food.ayurveda_guna || food['ayurveda_guna'],
        virya: food.ayurveda_virya || food['ayurveda_virya'],
        vipaka: food.ayurveda_vipaka || food['ayurveda_vipaka']
      },
      
      // Additional nutrition and health info
      vitamins: food.vitamins,
      minerals: food.minerals,
      health_tags: food.health_tags,
      medical_usage: food.medical_usage,
      contraindications: food.contraindications,
      therapeutic_dosage: food.therapeutic_dosage,
      preparation_methods: food.preparation_methods
    };
    
    console.log('📊 Nutrition data mapped:', nutritionData);
    console.log('🎯 Adding to meal plan:', { dayKey, mealKey });
    console.log('📋 Current meal plan before adding:', mealPlan[dayKey][mealKey]);
    
    setMealPlan(prev => {
      const updated = {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          [mealKey]: [...prev[dayKey][mealKey], nutritionData]
        }
      };
      console.log('📋 Updated meal plan after adding:', updated[dayKey][mealKey]);
      return updated;
    });
    setShowFoodSearch(false);
  };

  const removeFoodFromMeal = (dayKey, mealKey, foodIndex) => {
    setMealPlan(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [mealKey]: prev[dayKey][mealKey].filter((_, index) => index !== foodIndex)
      }
    }));
  };

    const applyTemplate = async (templateKey) => {
    const template = mealTemplates[templateKey];
    if (!template) return;

    console.log('📋 Applying template:', templateKey);
    setSelectedTemplate(templateKey);

    // Set plan details
    setPlanDetails(prev => ({
      ...prev,
      targetCalories: template.targetCalories,
      description: template.description,
      title: template.name
    }));

    try {
      // Get all available foods to work with
      const response = await ApiService.getAllFoods({ limit: 100 });
      const availableFoods = response.data?.foods || response.foods || [];
      console.log('🍽️ Available foods for template:', availableFoods.length);

      // Create food mapping based on categories and names
      const foodsByCategory = {};
      const foodsByName = {};
      
      availableFoods.forEach(food => {
        const category = food.category?.toLowerCase() || '';
        const name = (food.name_en || food.name || '').toLowerCase();
        
        if (!foodsByCategory[category]) foodsByCategory[category] = [];
        foodsByCategory[category].push(food);
        foodsByName[name] = food;
      });

      // Template food suggestions mapped to database foods
      const templateFoodMapping = {
        'weight-loss': {
          breakfast: ['oats', 'quinoa', 'green tea', 'almonds', 'berries'],
          lunch: ['quinoa', 'lentils', 'spinach', 'broccoli', 'beans'],
          dinner: ['rice', 'dal', 'vegetables', 'cauliflower', 'spinach'],
          snacks: ['cucumber', 'herbal tea', 'carrots', 'green tea']
        },
        'muscle-gain': {
          breakfast: ['eggs', 'milk', 'nuts', 'oats', 'banana'],
          lunch: ['chickpeas', 'quinoa', 'paneer', 'beans', 'spinach'],
          dinner: ['paneer', 'rice', 'dal', 'chicken', 'vegetables'],
          snacks: ['nuts', 'dates', 'milk', 'protein']
        },
        'diabetic': {
          breakfast: ['oats', 'cinnamon', 'walnuts', 'bitter gourd'],
          lunch: ['cauliflower', 'bitter gourd', 'spinach', 'beans'],
          dinner: ['methi', 'cucumber', 'bitter gourd', 'spinach'],
          snacks: ['chickpeas', 'green tea', 'nuts']
        },
        'heart-healthy': {
          breakfast: ['flax', 'fruits', 'green tea', 'oats'],
          lunch: ['fish', 'rice', 'broccoli', 'spinach'],
          dinner: ['lentils', 'quinoa', 'spinach', 'vegetables'],
          snacks: ['nuts', 'herbal tea', 'green tea']
        }
      };

      // Apply template to all days
      const newMealPlan = { ...mealPlan };
      const templateFoods = templateFoodMapping[templateKey] || {};

      Object.keys(newMealPlan).forEach(dayKey => {
        Object.keys(templateFoods).forEach(mealKey => {
          if (templateFoods[mealKey]) {
            const mealFoods = [];
            
            // Try to find matching foods for each template suggestion
            templateFoods[mealKey].forEach(suggestion => {
              // First try exact name match
              let matchedFood = Object.keys(foodsByName).find(name => 
                name.includes(suggestion) || suggestion.includes(name)
              );
              
              if (matchedFood) {
                const food = foodsByName[matchedFood];
                mealFoods.push({
                  foodId: food._id,
                  food_id: food.food_id,
                  name: food.name_en || food.name,
                  vernacular_names: food.vernacular_names,
                  quantity: '100g',
                  calories: food.calories || food['calories(kcal)'] || 0,
                  protein: food.protein || food['protein(g)'] || 0,
                  carbs: food.carbs || food['carbs(g)'] || 0,
                  fats: food.fats || food['fats(g)'] || 0,
                  fiber: food.fiber || food['fiber(g)'] || 0,
                  category: food.category,
                  ayurvedic: {
                    dosha_effects: {
                      vata: food.ayurveda_dosha_vata,
                      pitta: food.ayurveda_dosha_pitta,
                      kapha: food.ayurveda_dosha_kapha
                    },
                    rasa: food.ayurveda_rasa,
                    guna: food.ayurveda_guna,
                    virya: food.ayurveda_virya,
                    vipaka: food.ayurveda_vipaka
                  }
                });
              } else {
                // Try category-based matching
                const relevantCategories = ['cereal', 'vegetable', 'fruit', 'legume', 'nuts', 'herbs', 'spices'];
                const matchedCategory = relevantCategories.find(cat => 
                  foodsByCategory[cat] && foodsByCategory[cat].length > 0
                );
                
                if (matchedCategory && foodsByCategory[matchedCategory]) {
                  const randomFood = foodsByCategory[matchedCategory][0]; // Take first available
                  mealFoods.push({
                    foodId: randomFood._id,
                    food_id: randomFood.food_id,
                    name: randomFood.name_en || randomFood.name,
                    vernacular_names: randomFood.vernacular_names,
                    quantity: '100g',
                    calories: randomFood.calories || randomFood['calories(kcal)'] || 0,
                    protein: randomFood.protein || randomFood['protein(g)'] || 0,
                    carbs: randomFood.carbs || randomFood['carbs(g)'] || 0,
                    fats: randomFood.fats || randomFood['fats(g)'] || 0,
                    fiber: randomFood.fiber || randomFood['fiber(g)'] || 0,
                    category: randomFood.category,
                    ayurvedic: {
                      dosha_effects: {
                        vata: randomFood.ayurveda_dosha_vata,
                        pitta: randomFood.ayurveda_dosha_pitta,
                        kapha: randomFood.ayurveda_dosha_kapha
                      },
                      rasa: randomFood.ayurveda_rasa,
                      guna: randomFood.ayurveda_guna,
                      virya: randomFood.ayurveda_virya,
                      vipaka: randomFood.ayurveda_vipaka
                    }
                  });
                }
              }
            });
            
            newMealPlan[dayKey][mealKey] = mealFoods;
          }
        });
      });

      setMealPlan(newMealPlan);
      console.log('✅ Template applied successfully with database foods');
      
    } catch (error) {
      console.error('Error applying template:', error);
      // Fallback to empty template
      setPlanDetails(prev => ({
        ...prev,
        targetCalories: template.targetCalories,
        description: template.description
      }));
    }
  };



  const saveMealPlan = async (forceOverride = false) => {
    console.log('💾 Save Plan Called');
    console.log('📋 Patient ID:', patientId);
    console.log('👤 Patient Data:', patient);
    console.log('📊 Existing Plan:', existingPlan);
    
    if (!patientId) {
      alert('Patient ID not found. Please select a patient first.');
      return;
    }

    if (!patient) {
      console.warn('⚠️ Patient data not loaded, attempting to fetch...');
      try {
        await fetchPatient();
        // Retry save after fetching patient
        if (!patient) {
          alert('Unable to load patient information. Please try again.');
          return;
        }
      } catch (error) {
        console.error('❌ Error fetching patient for save:', error);
        alert('Error loading patient information. Please try again.');
        return;
      }
    }

    // Check if plan already exists and show confirmation if not forcing override
    if (existingPlan && !forceOverride) {
      setShowOverrideConfirmation(true);
      return;
    }

    try {
      setIsSaving(true);
      
      const mealPlanData = {
        patientId: patientId,
        title: planDetails.title,
        description: planDetails.description,
        duration: planDetails.duration,
        notes: planDetails.notes,
        targetCalories: planDetails.targetCalories,
        dietaryRestrictions: planDetails.dietaryRestrictions,
        nutritionSummary,
        mealPlan: Object.entries(mealPlan).map(([day, meals]) => ({
          day: day,
          meals: Object.entries(meals).map(([mealType, foods]) => ({
            type: mealType,
            foods: foods.map(food => ({
              foodId: food.foodId,
              name: food.name,
              quantity: food.quantity,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fats: food.fats,
              fiber: food.fiber,
              category: food.category
            }))
          }))
        })),
        status: 'active',
        planType: 'manual',
        createdBy: 'doctor' // You might want to get this from auth context
      };

      let response;
      if (existingPlan && forceOverride) {
        // Update existing plan
        response = await ApiService.updateMealPlan(existingPlan._id, mealPlanData);
        alert('Meal plan updated successfully!');
      } else {
        // Create new plan
        response = await ApiService.createMealPlan(mealPlanData);
        alert('Meal plan created successfully!');
      }

      console.log('Meal plan saved:', response);
      
      // Reset override confirmation
      setShowOverrideConfirmation(false);
      
      // Optionally redirect or refresh
      // window.location.href = '/meal-plans';
      
    } catch (error) {
      console.error('❌ Error saving meal plan:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save meal plan. Please try again.';
      
      if (error.message) {
        if (error.message.includes('401')) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to create meal plans.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Patient not found. Please verify the patient information.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid meal plan data. Please check all required fields.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
      }
      
      alert(`❌ ${errorMessage}\n\nDetails: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverrideConfirmation = (confirm) => {
    setShowOverrideConfirmation(false);
    if (confirm) {
      saveMealPlan(true);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, food) => {
    setDraggedFood(food);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleFoodItemDragStart = (e, food, sourceDay, sourceMeal, sourceIndex) => {
    console.log('🔄 Starting food item drag:', food.name, 'from', sourceDay, sourceMeal);
    const dragData = {
      food: food,
      sourceDay: sourceDay,
      sourceMeal: sourceMeal,
      sourceIndex: sourceIndex,
      type: 'existing-food'
    };
    setDraggedFood(dragData);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e, dayKey, mealKey) => {
    e.preventDefault();
    if (draggedFood) {
      if (draggedFood.type === 'existing-food') {
        // Duplicating existing food from one meal to another
        const { food, sourceDay, sourceMeal } = draggedFood;
        addFoodToMeal(food, dayKey, mealKey);
        console.log(`✅ Duplicated "${food.name}" from ${sourceDay}-${sourceMeal} to ${dayKey}-${mealKey}`);
      } else {
        // Adding new food from database
        addFoodToMeal(draggedFood, dayKey, mealKey);
      }
      setDraggedFood(null);
    }
  };

  // Modern styles
  const modernStyles = {
    container: {
      padding: '2rem',
      backgroundColor: '#F8FAFC',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    header: {
      background: 'linear-gradient(135deg, #2C5F41 0%, #3E8E5A 100%)',
      color: 'white',
      padding: '2rem',
      borderRadius: '16px',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(44, 95, 65, 0.3)'
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '2rem'
    },
    headerLeft: {
      flex: 1
    },
    headerRight: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '2rem',
      maxWidth: '1600px',
      margin: '0 auto'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    mainArea: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      border: '1px solid #E5E7EB'
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    mealPlanGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1rem',
      marginBottom: '2rem'
    },
    dayColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    dayHeader: {
      background: 'linear-gradient(135deg, #3E8E5A 0%, #48CC6C 100%)',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '8px',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '14px'
    },
    mealSlot: (mealType) => ({
      background: meals.find(m => m.key === mealType)?.color || '#F9FAFB',
      border: '2px dashed #D1D5DB',
      borderRadius: '8px',
      padding: '0.75rem',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }),
    mealHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    foodItem: {
      background: 'white',
      padding: '0.5rem',
      borderRadius: '6px',
      fontSize: '11px',
      border: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'grab'
    },
    nutritionBar: {
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    },
    nutritionItem: {
      textAlign: 'center'
    },
    button: {
      backgroundColor: '#3E8E5A',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buttonSecondary: {
      backgroundColor: '#6B7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      outline: 'none'
    },
    templateCard: (active) => ({
      background: active ? '#F0FDF4' : 'white',
      border: `2px solid ${active ? '#22C55E' : '#E5E7EB'}`,
      borderRadius: '8px',
      padding: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: '0.75rem'
    }),
    badge: {
      background: '#FEF3C7',
      color: '#92400E',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      display: 'inline-block',
      marginRight: '0.5rem',
      marginBottom: '0.25rem'
    }
  };

  if (loading && !patient) {
    return (
      <div style={modernStyles.container}>
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔄</div>
          <h3>Loading meal plan creation...</h3>
          <p>Please wait while we prepare your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div style={modernStyles.container}>
      {/* Modern Header */}
      <div style={modernStyles.header}>
        <div style={modernStyles.headerContent}>
          <div style={modernStyles.headerLeft}>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
              🍽️ Advanced Meal Plan Creator
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1.1rem' }}>
              {patient ? `Creating plan for ${patient.name}` : 'Professional meal planning tool'}
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={modernStyles.badge}>
                Target: {planDetails.targetCalories} cal/day
              </div>
              <div style={modernStyles.badge}>
                Duration: {planDetails.duration} days
              </div>
              {selectedTemplate && (
                <div style={modernStyles.badge}>
                  Template: {mealTemplates[selectedTemplate]?.name}
                </div>
              )}
            </div>
          </div>
          <div style={modernStyles.headerRight}>
            <button
              onClick={() => setViewMode(viewMode === 'weekly' ? 'daily' : 'weekly')}
              style={modernStyles.buttonSecondary}
            >
              {viewMode === 'weekly' ? '📅 Daily View' : '📊 Weekly View'}
            </button>
            <button
              onClick={saveMealPlan}
              disabled={isSaving || !planDetails.title.trim()}
              style={{
                ...modernStyles.button,
                backgroundColor: isSaving ? '#9CA3AF' : '#3E8E5A',
                cursor: isSaving || !planDetails.title.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? '⏳ Saving...' : existingPlan ? '🔄 Update Plan' : '💾 Save Plan'}
            </button>
            {existingPlan && (
              <div style={{ fontSize: '12px', color: '#F59E0B', marginTop: '0.5rem' }}>
                ⚠️ This will override the existing meal plan for this patient
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div style={modernStyles.layout}>
        
        {/* Left Sidebar */}
        <div style={modernStyles.sidebar}>
          
          {/* Food Search - Primary Section */}
          <div style={modernStyles.card}>
            <h3 style={modernStyles.cardTitle}>
              🔍 Food Database
            </h3>
            
            {/* Search by Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                Search Foods by Name {loading && '(Searching...)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search foods (e.g., rice, chicken, spinach)..."
                  style={{
                    ...modernStyles.input,
                    backgroundColor: '#F9FAFB',
                    marginBottom: '0.5rem',
                    borderColor: loading ? '#3B82F6' : '#E5E7EB',
                    paddingRight: searchTerm ? '2rem' : '0.75rem'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      fontSize: '14px',
                      padding: '0.25rem'
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchTerm && (
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                  Searching for: "{searchTerm}" {foods.length > 0 && `(${foods.length} results)`}
                </div>
              )}
            </div>
            
            {/* Category Filter */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                Filter by Category ({categories.length} available)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  ...modernStyles.input,
                  backgroundColor: '#F9FAFB'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {/* Debug info */}
              {categories.length === 0 && (
                <div style={{ fontSize: '10px', color: '#EF4444', marginTop: '4px' }}>
                  No categories loaded - using fallback
                </div>
              )}
              
              {/* Clear Filters Button */}
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '10px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#6B7280'
                  }}
                >
                  🗑️ Clear Filters
                </button>
              )}
            </div>
            
            {/* Results Count */}
            {foods.length > 0 && (
              <div style={{ 
                fontSize: '12px', 
                color: '#6B7280', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Showing {foods.length} food{foods.length !== 1 ? 's' : ''} 
                {selectedCategory !== 'all' && ` in "${selectedCategory}" category`}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            )}
            
            <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  🔍 Loading foods...
                </div>
              ) : foods.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  {searchTerm || selectedCategory !== 'all' ? (
                    <div>
                      <div>😔 No foods found</div>
                      <div style={{ fontSize: '10px', marginTop: '0.5rem' }}>
                        {searchTerm && `No results for "${searchTerm}"`}
                        {searchTerm && selectedCategory !== 'all' && ' in '}
                        {selectedCategory !== 'all' && `category "${selectedCategory}"`}
                      </div>
                      <div style={{ fontSize: '10px', marginTop: '0.5rem', color: '#9CA3AF' }}>
                        Try different keywords or clear filters
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>🍽️ Food Database</div>
                      <div style={{ fontSize: '10px', marginTop: '0.5rem' }}>
                        Search for foods or browse by category
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                foods.map((food, index) => (
                  <div
                    key={food._id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, food)}
                    style={{
                      ...modernStyles.foodItem,
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600' }}>{food.name_en || food.name}</div>
                      <div style={{ color: '#6B7280', fontSize: '10px' }}>
                        {food.calories || food['calories(kcal)'] || food.energy_kcal || 0} cal • 
                        {food.protein || food['protein(g)'] || food.protein_g || 0}g protein • {food.category}
                      </div>
                      {food.vernacular_names && (
                        <div style={{ color: '#9CA3AF', fontSize: '9px', marginTop: '2px' }}>
                          {food.vernacular_names.split(',')[0]}
                        </div>
                      )}
                      
                      {/* Ayurvedic Dosha Effects */}
                      <div style={{ fontSize: '8px', color: '#6B7280', marginTop: '4px' }}>
                        V: <span style={{ color: food.ayurveda_dosha_vata === 'Increase' ? '#EF4444' : '#10B981' }}>
                          {food.ayurveda_dosha_vata === 'Increase' ? '↑' : '↓'}
                        </span>
                        {' | '}
                        P: <span style={{ color: food.ayurveda_dosha_pitta === 'Increase' ? '#EF4444' : '#10B981' }}>
                          {food.ayurveda_dosha_pitta === 'Increase' ? '↑' : '↓'}
                        </span>
                        {' | '}
                        K: <span style={{ color: food.ayurveda_dosha_kapha === 'Increase' ? '#EF4444' : '#10B981' }}>
                          {food.ayurveda_dosha_kapha === 'Increase' ? '↑' : '↓'}
                        </span>
                        {food.ayurveda_rasa && ` • ${food.ayurveda_rasa}`}
                      </div>
                    </div>
                    <button
                      onClick={() => addFoodToMeal(food)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ➕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Templates - Secondary Section */}
          <div style={modernStyles.card}>
            <h3 style={modernStyles.cardTitle}>
              ⚡ Quick Templates
            </h3>
            {Object.entries(mealTemplates).map(([key, template]) => (
              <div
                key={key}
                onClick={() => applyTemplate(key)}
                style={modernStyles.templateCard(selectedTemplate === key)}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600' }}>
                  {template.name}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                  {template.description}
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '11px', color: '#059669' }}>
                  Target: {template.targetCalories} calories/day
                </div>
              </div>
            ))}
          </div>

          {/* Plan Settings */}
          <div style={modernStyles.card}>
            <h3 style={modernStyles.cardTitle}>
              ⚙️ Plan Settings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.25rem' }}>
                  Plan Title
                </label>
                <input
                  type="text"
                  value={planDetails.title}
                  onChange={(e) => setPlanDetails(prev => ({ ...prev, title: e.target.value }))}
                  style={modernStyles.input}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.25rem' }}>
                  Target Calories/Day
                </label>
                <input
                  type="number"
                  value={planDetails.targetCalories}
                  onChange={(e) => setPlanDetails(prev => ({ ...prev, targetCalories: parseInt(e.target.value) }))}
                  style={modernStyles.input}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                  Dietary Restrictions
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {dietaryRestrictions.map(restriction => (
                    <button
                      key={restriction}
                      onClick={() => {
                        setPlanDetails(prev => ({
                          ...prev,
                          dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                            ? prev.dietaryRestrictions.filter(r => r !== restriction)
                            : [...prev.dietaryRestrictions, restriction]
                        }));
                      }}
                      style={{
                        ...modernStyles.badge,
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: planDetails.dietaryRestrictions.includes(restriction) ? '#22C55E' : '#F3F4F6',
                        color: planDetails.dietaryRestrictions.includes(restriction) ? 'white' : '#6B7280'
                      }}
                    >
                      {restriction}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={modernStyles.mainArea}>
          
          {/* Nutrition Summary */}
          <div style={modernStyles.nutritionBar}>
            <div style={modernStyles.nutritionItem}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3E8E5A' }}>
                {nutritionSummary.totalCalories}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Calories/day</div>
            </div>
            <div style={modernStyles.nutritionItem}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#F59E0B' }}>
                {nutritionSummary.protein}g
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Protein</div>
            </div>
            <div style={modernStyles.nutritionItem}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#3B82F6' }}>
                {nutritionSummary.carbs}g
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Carbs</div>
            </div>
            <div style={modernStyles.nutritionItem}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#EF4444' }}>
                {nutritionSummary.fats}g
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Fats</div>
            </div>
            <div style={modernStyles.nutritionItem}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#10B981' }}>
                {nutritionSummary.fiber}g
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>Fiber</div>
            </div>
            
            {/* Dosha Effects */}
            {nutritionSummary.doshaEffects && (
              <>
                <div style={modernStyles.nutritionItem}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#8B5CF6' }}>
                    <span style={{ color: '#10B981' }}>↓{nutritionSummary.doshaEffects.vata.decrease}</span>
                    {' / '}
                    <span style={{ color: '#EF4444' }}>↑{nutritionSummary.doshaEffects.vata.increase}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Vata</div>
                </div>
                <div style={modernStyles.nutritionItem}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#F59E0B' }}>
                    <span style={{ color: '#10B981' }}>↓{nutritionSummary.doshaEffects.pitta.decrease}</span>
                    {' / '}
                    <span style={{ color: '#EF4444' }}>↑{nutritionSummary.doshaEffects.pitta.increase}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Pitta</div>
                </div>
                <div style={modernStyles.nutritionItem}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#06B6D4' }}>
                    <span style={{ color: '#10B981' }}>↓{nutritionSummary.doshaEffects.kapha.decrease}</span>
                    {' / '}
                    <span style={{ color: '#EF4444' }}>↑{nutritionSummary.doshaEffects.kapha.increase}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Kapha</div>
                </div>
              </>
            )}
          </div>

          {/* Weekly Meal Plan Grid */}
          <div style={modernStyles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={modernStyles.cardTitle}>
                📅 Weekly Meal Plan
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    const confirmed = window.confirm('Clear all meals? This cannot be undone.');
                    if (confirmed) {
                      setMealPlan({
                        day1: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                        day2: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                        day3: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                        day4: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                        day5: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                        day6: { breakfast: [], lunch: [], dinner: [], snacks: [] },
                        day7: { breakfast: [], lunch: [], dinner: [], snacks: [] }
                      });
                    }
                  }}
                  style={modernStyles.buttonSecondary}
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>

            <div style={modernStyles.mealPlanGrid}>
              {days.map(day => (
                <div key={day.key} style={modernStyles.dayColumn}>
                  <div style={modernStyles.dayHeader}>
                    {day.label}
                  </div>
                  
                  {meals.map(meal => (
                    <div
                      key={meal.key}
                      style={modernStyles.mealSlot(meal.key)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day.key, meal.key)}
                      onClick={() => {
                        setSelectedDay(day.key);
                        setSelectedMeal(meal.key);
                        setShowFoodSearch(true);
                      }}
                    >
                      <div style={modernStyles.mealHeader}>
                        <span>{meal.icon}</span>
                        <span>{meal.label}</span>
                        <span style={{ fontSize: '8px', color: '#6B7280' }}>
                          ({mealPlan[day.key][meal.key].length})
                        </span>
                      </div>
                      
                      {/* Debug: Show if empty */}
                      {mealPlan[day.key][meal.key].length === 0 && (
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#9CA3AF', 
                          fontStyle: 'italic',
                          textAlign: 'center',
                          padding: '0.5rem 0'
                        }}>
                          Click to add foods
                        </div>
                      )}
                      
                      {mealPlan[day.key][meal.key].map((food, index) => {
                        console.log(`🍽️ Rendering food for ${day.key}-${meal.key}:`, food);
                        return (
                          <div 
                            key={index} 
                            style={{
                              ...modernStyles.foodItem,
                              cursor: 'grab',
                              border: '1px solid #E5E7EB',
                              borderRadius: '6px',
                              position: 'relative',
                              transition: 'all 0.2s ease'
                            }}
                            draggable
                            onDragStart={(e) => {
                              e.target.style.cursor = 'grabbing';
                              handleFoodItemDragStart(e, food, day.key, meal.key, index);
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#F3F4F6';
                              e.target.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#F9FAFB';
                              e.target.style.transform = 'scale(1)';
                            }}
                            title="Drag to duplicate to another meal"
                          >
                            <div style={{ 
                              position: 'absolute', 
                              top: '2px', 
                              left: '2px', 
                              fontSize: '8px',
                              color: '#9CA3AF'
                            }}>
                              ⋮⋮
                            </div>
                            <div style={{ marginLeft: '12px' }}>
                              <div style={{ fontWeight: '600' }}>{food.name}</div>
                              <div style={{ color: '#6B7280', fontSize: '10px' }}>
                                {food.calories} cal • {food.protein}g protein • {food.quantity}
                              </div>
                              {food.vernacular_names && (
                                <div style={{ color: '#9CA3AF', fontSize: '8px', marginTop: '2px' }}>
                                  {food.vernacular_names.split(',')[0]}
                                </div>
                              )}
                              
                              {/* Ayurvedic Properties Display */}
                              {food.ayurvedic && (
                                <div style={{ fontSize: '8px', color: '#6B7280', marginTop: '3px' }}>
                                  V: <span style={{ 
                                    color: food.ayurvedic.dosha_effects?.vata === 'Increase' ? '#EF4444' : '#10B981',
                                    fontWeight: '600'
                                  }}>
                                    {food.ayurvedic.dosha_effects?.vata === 'Increase' ? '↑' : '↓'}
                                  </span>
                                  {' | '}
                                  P: <span style={{ 
                                    color: food.ayurvedic.dosha_effects?.pitta === 'Increase' ? '#EF4444' : '#10B981',
                                    fontWeight: '600'
                                  }}>
                                    {food.ayurvedic.dosha_effects?.pitta === 'Increase' ? '↑' : '↓'}
                                  </span>
                                  {' | '}
                                  K: <span style={{ 
                                    color: food.ayurvedic.dosha_effects?.kapha === 'Increase' ? '#EF4444' : '#10B981',
                                    fontWeight: '600'
                                  }}>
                                    {food.ayurvedic.dosha_effects?.kapha === 'Increase' ? '↑' : '↓'}
                                  </span>
                                  {food.ayurvedic.rasa && ` • ${food.ayurvedic.rasa}`}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFoodFromMeal(day.key, meal.key, index);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#EF4444',
                                fontSize: '14px'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}                      {mealPlan[day.key][meal.key].length === 0 && (
                        <div style={{ 
                          color: '#9CA3AF', 
                          fontSize: '12px', 
                          textAlign: 'center',
                          fontStyle: 'italic',
                          padding: '1rem'
                        }}>
                          Drag foods here or click to add
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Food Search Modal */}
      {showFoodSearch && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Add Food to {meals.find(m => m.key === selectedMeal)?.label} - {days.find(d => d.key === selectedDay)?.label}</h3>
              <button
                onClick={() => setShowFoodSearch(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Enhanced Search Interface - Same as main food database */}
            {/* Search by Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                Search Foods by Name {loading && '(Searching...)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search foods (e.g., rice, chicken, spinach)..."
                  style={{
                    ...modernStyles.input,
                    backgroundColor: '#F9FAFB',
                    marginBottom: '0.5rem',
                    borderColor: loading ? '#3B82F6' : '#E5E7EB',
                    paddingRight: searchTerm ? '2rem' : '0.75rem'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6B7280',
                      fontSize: '14px',
                      padding: '0.25rem'
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchTerm && (
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                  Searching for: "{searchTerm}" {foods.length > 0 && `(${foods.length} results)`}
                </div>
              )}
            </div>
            
            {/* Category Filter */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                Filter by Category ({categories.length} available)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  ...modernStyles.input,
                  backgroundColor: '#F9FAFB'
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              {/* Clear Filters Button */}
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: '10px',
                    backgroundColor: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#6B7280'
                  }}
                >
                  🗑️ Clear Filters
                </button>
              )}
            </div>
            
            {/* Results Count in Modal */}
            {foods.length > 0 && (
              <div style={{ 
                fontSize: '12px', 
                color: '#6B7280', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Showing {foods.length} food{foods.length !== 1 ? 's' : ''} 
                {selectedCategory !== 'all' && ` in "${selectedCategory}" category`}
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
            )}
            
            <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  🔍 Loading foods...
                </div>
              ) : foods.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
                  {searchTerm || selectedCategory !== 'all' ? (
                    <div>
                      <div>😔 No foods found</div>
                      <div style={{ fontSize: '10px', marginTop: '0.5rem' }}>
                        {searchTerm && `No results for "${searchTerm}"`}
                        {searchTerm && selectedCategory !== 'all' && ' in '}
                        {selectedCategory !== 'all' && `category "${selectedCategory}"`}
                      </div>
                      <div style={{ fontSize: '10px', marginTop: '0.5rem', color: '#9CA3AF' }}>
                        Try different keywords or clear filters
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>🍽️ Search for foods to add</div>
                      <div style={{ fontSize: '10px', marginTop: '0.5rem' }}>
                        Use the search box or browse by category
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                foods.map((food, index) => (
                  <div
                    key={food._id || index}
                    onClick={() => addFoodToMeal(food)}
                    style={{
                      ...modernStyles.foodItem,
                      marginBottom: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600' }}>{food.name_en || food.name}</div>
                      <div style={{ color: '#6B7280', fontSize: '12px' }}>
                        {food.calories || food['calories(kcal)'] || food.energy_kcal || 0} cal • 
                        {food.protein || food['protein(g)'] || food.protein_g || 0}g protein • {food.category}
                      </div>
                      {food.vernacular_names && (
                        <div style={{ color: '#9CA3AF', fontSize: '10px', marginTop: '2px' }}>
                          {food.vernacular_names.split(',')[0]}
                        </div>
                      )}
                      
                      {/* Ayurvedic Dosha Effects */}
                      <div style={{ fontSize: '9px', color: '#6B7280', marginTop: '4px' }}>
                        V: <span style={{ color: food.ayurveda_dosha_vata === 'Increase' ? '#EF4444' : '#10B981' }}>
                          {food.ayurveda_dosha_vata === 'Increase' ? '↑' : '↓'}
                        </span>
                        {' | '}
                        P: <span style={{ color: food.ayurveda_dosha_pitta === 'Increase' ? '#EF4444' : '#10B981' }}>
                          {food.ayurveda_dosha_pitta === 'Increase' ? '↑' : '↓'}
                        </span>
                        {' | '}
                        K: <span style={{ color: food.ayurveda_dosha_kapha === 'Increase' ? '#EF4444' : '#10B981' }}>
                          {food.ayurveda_dosha_kapha === 'Increase' ? '↑' : '↓'}
                        </span>
                        {food.ayurveda_rasa && ` • ${food.ayurveda_rasa}`}
                      </div>
                    </div>
                    <div style={{ fontSize: '16px' }}>➕</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Override Confirmation Modal */}
      {showOverrideConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            margin: '1rem',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ color: '#F59E0B', marginBottom: '1rem' }}>
              ⚠️ Override Existing Plan?
            </h3>
            <p style={{ marginBottom: '1.5rem', color: '#374151' }}>
              This patient already has a meal plan. Creating a new plan will override the existing one. 
              Are you sure you want to continue?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleOverrideConfirmation(false)}
                style={{
                  ...modernStyles.buttonSecondary,
                  backgroundColor: '#6B7280'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleOverrideConfirmation(true)}
                style={{
                  ...modernStyles.button,
                  backgroundColor: '#EF4444'
                }}
              >
                Override Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanCreationScreen;