const Food = require('../models/Food');

// Get all foods with optional filtering and pagination
const getAllFoods = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      dosha,
      sortBy = 'name_en',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { name_en: { $regex: search, $options: 'i' } },
        { vernacular_names: { $regex: search, $options: 'i' } },
        { health_tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dosha) {
      const doshaFilters = {
        vata: { ayurveda_dosha_vata: { $regex: 'beneficial|pacify', $options: 'i' } },
        pitta: { ayurveda_dosha_pitta: { $regex: 'beneficial|pacify', $options: 'i' } },
        kapha: { ayurveda_dosha_kapha: { $regex: 'beneficial|pacify', $options: 'i' } }
      };
      
      if (doshaFilters[dosha.toLowerCase()]) {
        Object.assign(filter, doshaFilters[dosha.toLowerCase()]);
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const foods = await Food.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'); // Exclude version field

    // Get total count for pagination
    const total = await Food.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        foods,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          limit: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all foods error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching foods'
    });
  }
};

// Get single food by ID
const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const food = await Food.findOne({ 
      $or: [
        { _id: id },
        { food_id: id }
      ]
    }).select('-__v');

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    res.status(200).json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Get food by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching food'
    });
  }
};

// Get all unique categories
const getCategories = async (req, res) => {
  try {
    const categories = await Food.distinct('category');
    const filteredCategories = categories.filter(cat => cat && cat.trim() !== '');
    
    res.status(200).json({
      success: true,
      data: filteredCategories.sort()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching categories'
    });
  }
};

// Get foods by dosha recommendations
const getFoodsByDosha = async (req, res) => {
  try {
    const { dosha } = req.params;
    const { limit = 20 } = req.query;

    if (!['vata', 'pitta', 'kapha'].includes(dosha.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dosha. Must be vata, pitta, or kapha'
      });
    }

    const doshaField = `ayurveda_dosha_${dosha.toLowerCase()}`;
    
    const foods = await Food.find({
      [doshaField]: { $regex: 'beneficial|pacify|good', $options: 'i' }
    })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('Get foods by dosha error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching foods by dosha'
    });
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  getCategories,
  getFoodsByDosha
};