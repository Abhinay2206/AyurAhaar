const express = require('express');
const { 
  getAllFoods, 
  getFoodById, 
  getCategories, 
  getFoodsByDosha 
} = require('../controllers/food.controller');

const router = express.Router();

// GET /api/foods - Get all foods with filtering and pagination
router.get('/', getAllFoods);

// GET /api/foods/categories - Get all unique food categories
router.get('/categories', getCategories);

// GET /api/foods/dosha/:dosha - Get foods beneficial for specific dosha
router.get('/dosha/:dosha', getFoodsByDosha);

// GET /api/foods/:id - Get single food by ID
router.get('/:id', getFoodById);

module.exports = router;