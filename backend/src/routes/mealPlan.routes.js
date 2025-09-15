const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdminRole } = require('../middleware/auth.middleware');
const MealPlan = require('../models/MealPlan');
const Patient = require('../models/Patient');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create meal plan
router.post('/', async (req, res) => {
  try {
    const { patientId, title, description, duration, targetCalories, mealPlan, planDetails, nutritionSummary } = req.body;
    
    console.log('📝 Creating meal plan for patient:', patientId);
    console.log('📊 Received meal plan structure:', JSON.stringify(mealPlan, null, 2));
    
    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      console.log('❌ Patient not found:', patientId);
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    // Transform mealPlan from array format to object format expected by schema
    let transformedMealPlan = {};
    if (Array.isArray(mealPlan)) {
      console.log('🔄 Transforming array format meal plan to object format');
      mealPlan.forEach(dayData => {
        if (dayData.day && dayData.meals) {
          // Initialize the day object
          transformedMealPlan[dayData.day] = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
          };
          
          // Transform from nested array structure to flat meal type structure
          dayData.meals.forEach(mealTypeData => {
            if (mealTypeData.type && mealTypeData.foods && Array.isArray(mealTypeData.foods)) {
              transformedMealPlan[dayData.day][mealTypeData.type] = mealTypeData.foods;
            }
          });
        }
      });
    } else if (typeof mealPlan === 'object' && mealPlan !== null) {
      // Already in the correct object format
      transformedMealPlan = mealPlan;
    }
    
    console.log('🍽️ Transformed meal plan structure:', Object.keys(transformedMealPlan));
    
    // Check if patient already has a meal plan and remove it
    const existingPlan = await MealPlan.findOne({ patientId });
    if (existingPlan) {
      console.log('⚠️ Patient already has a meal plan, will override existing plan:', existingPlan._id);
      await MealPlan.findByIdAndDelete(existingPlan._id);
    }
    
    // Also update the patient's currentPlan if it exists
    if (patient.currentPlan) {
      console.log('🔄 Updating patient current plan reference');
      patient.currentPlan = null;
      await patient.save();
    }
    
    const newMealPlan = new MealPlan({
      patientId,
      title: title || `Meal Plan for ${patient.name}`,
      description: description || '',
      duration: duration || 7,
      targetCalories: targetCalories || 2000,
      mealPlan: transformedMealPlan,
      planDetails: planDetails || {},
      nutritionSummary: nutritionSummary || {},
      createdBy: req.user.userId,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newMealPlan.save();
    
    // Update patient's currentPlan reference
    patient.currentPlan = {
      type: 'meal-plan',
      planId: newMealPlan._id,
      isVisible: true,
      createdAt: new Date(),
      lastModified: new Date()
    };
    await patient.save();
    
    console.log('✅ Meal plan created successfully:', newMealPlan._id);
    console.log('🔗 Updated patient current plan reference');
    
    res.status(201).json({
      success: true,
      message: 'Meal plan created successfully',
      data: {
        ...newMealPlan.toObject(),
        patient: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone
        }
      }
    });
  } catch (error) {
    console.error('❌ Error creating meal plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating meal plan',
      error: error.message 
    });
  }
});

// Update meal plan
router.put('/:planId', async (req, res) => {
  try {
    console.log('📝 Updating meal plan:', req.params.planId);
    
    const { planId } = req.params;
    const updates = req.body;
    
    const mealPlan = await MealPlan.findByIdAndUpdate(
      planId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!mealPlan) {
      console.log('❌ Meal plan not found:', planId);
      return res.status(404).json({ 
        success: false, 
        message: 'Meal plan not found' 
      });
    }
    
    console.log('✅ Meal plan updated successfully:', planId);
    
    res.json({
      success: true,
      message: 'Meal plan updated successfully',
      data: mealPlan
    });
  } catch (error) {
    console.error('❌ Error updating meal plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating meal plan',
      error: error.message 
    });
  }
});

// Get meal plans for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    console.log('🔍 Getting meal plans for patient:', req.params.patientId);
    
    const { patientId } = req.params;
    
    const mealPlans = await MealPlan.find({ patientId })
      .sort({ createdAt: -1 });
    
    console.log('✅ Found meal plans:', mealPlans.length);
    
    res.json({
      success: true,
      data: {
        plans: mealPlans,
        total: mealPlans.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching patient meal plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching meal plans',
      error: error.message 
    });
  }
});

// Get meal plan by ID
router.get('/:planId', async (req, res) => {
  try {
    console.log('🔍 Getting meal plan by ID:', req.params.planId);
    
    const { planId } = req.params;
    
    const mealPlan = await MealPlan.findById(planId);
    
    if (!mealPlan) {
      console.log('❌ Meal plan not found:', planId);
      return res.status(404).json({ 
        success: false, 
        message: 'Meal plan not found' 
      });
    }
    
    console.log('✅ Meal plan found:', planId);
    
    res.json({
      success: true,
      data: mealPlan
    });
  } catch (error) {
    console.error('❌ Error fetching meal plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching meal plan',
      error: error.message 
    });
  }
});

// Delete meal plan
router.delete('/:planId', async (req, res) => {
  try {
    console.log('🗑️ Deleting meal plan:', req.params.planId);
    
    const { planId } = req.params;
    
    const mealPlan = await MealPlan.findByIdAndDelete(planId);
    
    if (!mealPlan) {
      console.log('❌ Meal plan not found:', planId);
      return res.status(404).json({ 
        success: false, 
        message: 'Meal plan not found' 
      });
    }
    
    console.log('✅ Meal plan deleted successfully:', planId);
    
    res.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting meal plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting meal plan',
      error: error.message 
    });
  }
});

// Get all meal plans (admin only)
router.get('/', requireAdminRole, async (req, res) => {
  try {
    console.log('🔍 Getting all meal plans');
    
    const { page = 1, limit = 20, status, patientName } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    let query = MealPlan.find(filter)
      .sort({ createdAt: -1 });
    
    if (patientName) {
      // We'll handle patient name filtering differently since we can't populate
      // For now, we'll skip the patient name filter or implement it differently
    }
    
    const mealPlans = await query
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await MealPlan.countDocuments(filter);
    
    console.log('✅ Found meal plans:', mealPlans.length);
    
    res.json({
      success: true,
      data: {
        plans: mealPlans,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching all meal plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching meal plans',
      error: error.message 
    });
  }
});

module.exports = router;