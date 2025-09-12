import React, { useState } from 'react';
import { Card, Button, Input } from '../../components';
import './FoodDatabase.css';

// Mock food data based on the CSV structure
const mockFoodItems = [
  {
    id: 'FOOD001',
    name: 'Wheat Dalia',
    category: 'Grains',
    subcategory: 'Whole Grains',
    calories: 346,
    protein: 12.1,
    carbs: 72.6,
    fat: 1.7,
    fiber: 11.5,
    rasa: 'Sweet',
    virya: 'Heating',
    vipaka: 'Sweet',
    doshaEffects: {
      vata: 'Decreases',
      pitta: 'Increases',
      kapha: 'Decreases'
    },
    benefits: ['Digestive health', 'Weight management', 'Heart health'],
    contraindications: ['Celiac disease', 'Gluten sensitivity'],
    status: 'verified',
    addedDate: '2024-01-15',
    lastModified: '2024-02-20'
  },
  {
    id: 'FOOD002',
    name: 'Medicinal Bitter Gourd',
    category: 'Vegetables',
    subcategory: 'Bitter Vegetables',
    calories: 17,
    protein: 1.0,
    carbs: 3.7,
    fat: 0.17,
    fiber: 2.8,
    rasa: 'Bitter',
    virya: 'Cooling',
    vipaka: 'Pungent',
    doshaEffects: {
      vata: 'Increases',
      pitta: 'Decreases',
      kapha: 'Decreases'
    },
    benefits: ['Blood sugar control', 'Liver detox', 'Skin health'],
    contraindications: ['Pregnancy', 'Low blood sugar'],
    status: 'pending',
    addedDate: '2024-03-10',
    lastModified: '2024-03-10'
  },
  {
    id: 'FOOD003',
    name: 'Sprouted Moong',
    category: 'Legumes',
    subcategory: 'Sprouted Legumes',
    calories: 30,
    protein: 3.04,
    carbs: 5.94,
    fat: 0.18,
    fiber: 1.8,
    rasa: 'Sweet, Astringent',
    virya: 'Cooling',
    vipaka: 'Sweet',
    doshaEffects: {
      vata: 'Neutral',
      pitta: 'Decreases',
      kapha: 'Decreases'
    },
    benefits: ['Easy digestion', 'Protein source', 'Weight loss'],
    contraindications: ['Excessive consumption'],
    status: 'verified',
    addedDate: '2024-01-08',
    lastModified: '2024-01-25'
  },
  {
    id: 'FOOD004',
    name: 'Ghee',
    category: 'Dairy',
    subcategory: 'Clarified Butter',
    calories: 884,
    protein: 0.28,
    carbs: 0.04,
    fat: 99.48,
    fiber: 0,
    rasa: 'Sweet',
    virya: 'Heating',
    vipaka: 'Sweet',
    doshaEffects: {
      vata: 'Decreases',
      pitta: 'Neutral',
      kapha: 'Increases'
    },
    benefits: ['Brain health', 'Digestive fire', 'Immunity'],
    contraindications: ['High cholesterol', 'Obesity'],
    status: 'verified',
    addedDate: '2023-12-05',
    lastModified: '2024-01-15'
  }
];

const categories = [
  'All Categories',
  'Grains',
  'Vegetables',
  'Legumes',
  'Fruits',
  'Dairy',
  'Spices',
  'Oils',
  'Nuts & Seeds'
];

const rasaOptions = ['Sweet', 'Sour', 'Salty', 'Pungent', 'Bitter', 'Astringent'];
const viryaOptions = ['Heating', 'Cooling'];
const vipakaOptions = ['Sweet', 'Sour', 'Pungent'];
const doshaOptions = ['Increases', 'Decreases', 'Neutral'];

const FoodDatabase = () => {
  const [foodItems, setFoodItems] = useState(mockFoodItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [newFood, setNewFood] = useState({
    name: '',
    category: '',
    subcategory: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    rasa: '',
    virya: '',
    vipaka: '',
    doshaEffects: { vata: '', pitta: '', kapha: '' },
    benefits: [],
    contraindications: []
  });

  const filteredFoodItems = foodItems.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || food.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || food.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      verified: '#22c55e',
      pending: '#f59e0b',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: '✅ Verified',
      pending: '⏳ Pending',
      rejected: '❌ Rejected'
    };
    return badges[status] || status;
  };

  const getDoshaColor = (effect) => {
    const colors = {
      'Increases': '#ef4444',
      'Decreases': '#22c55e',
      'Neutral': '#6b7280'
    };
    return colors[effect] || '#6b7280';
  };

  const handleStatusChange = (foodId, newStatus) => {
    setFoodItems(prev => prev.map(food => 
      food.id === foodId ? { 
        ...food, 
        status: newStatus,
        lastModified: new Date().toISOString().split('T')[0]
      } : food
    ));
  };

  const handleAddFood = () => {
    const foodWithId = {
      ...newFood,
      id: `FOOD${String(foodItems.length + 1).padStart(3, '0')}`,
      status: 'pending',
      addedDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    setFoodItems(prev => [...prev, foodWithId]);
    setNewFood({
      name: '', category: '', subcategory: '', calories: '', protein: '', 
      carbs: '', fat: '', fiber: '', rasa: '', virya: '', vipaka: '',
      doshaEffects: { vata: '', pitta: '', kapha: '' },
      benefits: [], contraindications: []
    });
    setShowAddModal(false);
  };

  const handleDeleteFood = (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      setFoodItems(prev => prev.filter(food => food.id !== foodId));
    }
  };

  const AddFoodModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Food Item</h2>
          <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-sections">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <Input
                  label="Food Name"
                  value={newFood.name}
                  onChange={(e) => setNewFood(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter food name"
                />
                <div className="input-group">
                  <label>Category</label>
                  <select
                    value={newFood.category}
                    onChange={(e) => setNewFood(prev => ({...prev, category: e.target.value}))}
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Subcategory"
                  value={newFood.subcategory}
                  onChange={(e) => setNewFood(prev => ({...prev, subcategory: e.target.value}))}
                  placeholder="Enter subcategory"
                />
              </div>
            </div>

            {/* Nutritional Information */}
            <div className="form-section">
              <h3>Nutritional Information (per 100g)</h3>
              <div className="form-grid">
                <Input
                  label="Calories"
                  type="number"
                  value={newFood.calories}
                  onChange={(e) => setNewFood(prev => ({...prev, calories: e.target.value}))}
                  placeholder="0"
                />
                <Input
                  label="Protein (g)"
                  type="number"
                  step="0.1"
                  value={newFood.protein}
                  onChange={(e) => setNewFood(prev => ({...prev, protein: e.target.value}))}
                  placeholder="0.0"
                />
                <Input
                  label="Carbs (g)"
                  type="number"
                  step="0.1"
                  value={newFood.carbs}
                  onChange={(e) => setNewFood(prev => ({...prev, carbs: e.target.value}))}
                  placeholder="0.0"
                />
                <Input
                  label="Fat (g)"
                  type="number"
                  step="0.1"
                  value={newFood.fat}
                  onChange={(e) => setNewFood(prev => ({...prev, fat: e.target.value}))}
                  placeholder="0.0"
                />
                <Input
                  label="Fiber (g)"
                  type="number"
                  step="0.1"
                  value={newFood.fiber}
                  onChange={(e) => setNewFood(prev => ({...prev, fiber: e.target.value}))}
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Ayurvedic Properties */}
            <div className="form-section">
              <h3>Ayurvedic Properties</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Rasa (Taste)</label>
                  <select
                    value={newFood.rasa}
                    onChange={(e) => setNewFood(prev => ({...prev, rasa: e.target.value}))}
                  >
                    <option value="">Select rasa</option>
                    {rasaOptions.map(rasa => (
                      <option key={rasa} value={rasa}>{rasa}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Virya (Potency)</label>
                  <select
                    value={newFood.virya}
                    onChange={(e) => setNewFood(prev => ({...prev, virya: e.target.value}))}
                  >
                    <option value="">Select virya</option>
                    {viryaOptions.map(virya => (
                      <option key={virya} value={virya}>{virya}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Vipaka (Post-digestive effect)</label>
                  <select
                    value={newFood.vipaka}
                    onChange={(e) => setNewFood(prev => ({...prev, vipaka: e.target.value}))}
                  >
                    <option value="">Select vipaka</option>
                    {vipakaOptions.map(vipaka => (
                      <option key={vipaka} value={vipaka}>{vipaka}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dosha Effects */}
            <div className="form-section">
              <h3>Dosha Effects</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Vata Effect</label>
                  <select
                    value={newFood.doshaEffects.vata}
                    onChange={(e) => setNewFood(prev => ({
                      ...prev, 
                      doshaEffects: {...prev.doshaEffects, vata: e.target.value}
                    }))}
                  >
                    <option value="">Select effect</option>
                    {doshaOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Pitta Effect</label>
                  <select
                    value={newFood.doshaEffects.pitta}
                    onChange={(e) => setNewFood(prev => ({
                      ...prev, 
                      doshaEffects: {...prev.doshaEffects, pitta: e.target.value}
                    }))}
                  >
                    <option value="">Select effect</option>
                    {doshaOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Kapha Effect</label>
                  <select
                    value={newFood.doshaEffects.kapha}
                    onChange={(e) => setNewFood(prev => ({
                      ...prev, 
                      doshaEffects: {...prev.doshaEffects, kapha: e.target.value}
                    }))}
                  >
                    <option value="">Select effect</option>
                    {doshaOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddFood}>Add Food Item</Button>
        </div>
      </div>
    </div>
  );

  const FoodDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Food Item Details</h2>
          <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
        </div>
        <div className="modal-body">
          {selectedFood && (
            <div className="food-details">
              <div className="food-header">
                <h3>{selectedFood.name}</h3>
                <span 
                  className="status-badge"
                  style={{color: getStatusColor(selectedFood.status)}}
                >
                  {getStatusBadge(selectedFood.status)}
                </span>
              </div>

              <div className="details-sections">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Category:</label>
                      <span>{selectedFood.category}</span>
                    </div>
                    <div className="detail-item">
                      <label>Subcategory:</label>
                      <span>{selectedFood.subcategory}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Nutritional Information (per 100g)</h4>
                  <div className="nutrition-grid">
                    <div className="nutrition-item">
                      <span className="nutrition-value">{selectedFood.calories}</span>
                      <span className="nutrition-label">Calories</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrition-value">{selectedFood.protein}g</span>
                      <span className="nutrition-label">Protein</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrition-value">{selectedFood.carbs}g</span>
                      <span className="nutrition-label">Carbs</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrition-value">{selectedFood.fat}g</span>
                      <span className="nutrition-label">Fat</span>
                    </div>
                    <div className="nutrition-item">
                      <span className="nutrition-value">{selectedFood.fiber}g</span>
                      <span className="nutrition-label">Fiber</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Ayurvedic Properties</h4>
                  <div className="ayurvedic-properties">
                    <div className="property-item">
                      <label>Rasa (Taste):</label>
                      <span>{selectedFood.rasa}</span>
                    </div>
                    <div className="property-item">
                      <label>Virya (Potency):</label>
                      <span>{selectedFood.virya}</span>
                    </div>
                    <div className="property-item">
                      <label>Vipaka (Post-digestive):</label>
                      <span>{selectedFood.vipaka}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Dosha Effects</h4>
                  <div className="dosha-effects">
                    <div className="dosha-item">
                      <span className="dosha-name">Vata:</span>
                      <span 
                        className="dosha-effect"
                        style={{color: getDoshaColor(selectedFood.doshaEffects.vata)}}
                      >
                        {selectedFood.doshaEffects.vata}
                      </span>
                    </div>
                    <div className="dosha-item">
                      <span className="dosha-name">Pitta:</span>
                      <span 
                        className="dosha-effect"
                        style={{color: getDoshaColor(selectedFood.doshaEffects.pitta)}}
                      >
                        {selectedFood.doshaEffects.pitta}
                      </span>
                    </div>
                    <div className="dosha-item">
                      <span className="dosha-name">Kapha:</span>
                      <span 
                        className="dosha-effect"
                        style={{color: getDoshaColor(selectedFood.doshaEffects.kapha)}}
                      >
                        {selectedFood.doshaEffects.kapha}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Health Benefits</h4>
                  <div className="benefits-list">
                    {selectedFood.benefits.map((benefit, index) => (
                      <span key={index} className="benefit-tag">✓ {benefit}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Contraindications</h4>
                  <div className="contraindications-list">
                    {selectedFood.contraindications.map((contra, index) => (
                      <span key={index} className="contraindication-tag">⚠️ {contra}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
          <Button variant="primary">Edit Food Item</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="food-database">
      <div className="page-header">
        <div className="header-content">
          <h1>🥗 Food Database Management</h1>
          <p>Manage Ayurvedic food items, nutritional data, and properties</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + Add New Food
        </Button>
      </div>

      {/* Statistics */}
      <div className="stats-overview">
        <Card className="stat-card verified">
          <div className="stat-content">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-number">{foodItems.filter(f => f.status === 'verified').length}</span>
              <span className="stat-label">Verified Items</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card pending">
          <div className="stat-content">
            <span className="stat-icon">⏳</span>
            <div className="stat-info">
              <span className="stat-number">{foodItems.filter(f => f.status === 'pending').length}</span>
              <span className="stat-label">Pending Review</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card categories">
          <div className="stat-content">
            <span className="stat-icon">📂</span>
            <div className="stat-info">
              <span className="stat-number">{new Set(foodItems.map(f => f.category)).size}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </Card>
        <Card className="stat-card total">
          <div className="stat-content">
            <span className="stat-icon">🍽️</span>
            <div className="stat-info">
              <span className="stat-number">{foodItems.length}</span>
              <span className="stat-label">Total Items</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="filters-section">
        <div className="filters-grid">
          <Input
            type="text"
            placeholder="Search food items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Food Items List */}
      <Card className="food-list">
        <div className="list-header">
          <h3>Food Items ({filteredFoodItems.length})</h3>
        </div>
        <div className="food-grid">
          {filteredFoodItems.map(food => (
            <div key={food.id} className="food-card">
              <div className="food-header">
                <div className="food-info">
                  <h4>{food.name}</h4>
                  <p className="food-category">{food.category} • {food.subcategory}</p>
                  <span 
                    className="status-badge"
                    style={{color: getStatusColor(food.status)}}
                  >
                    {getStatusBadge(food.status)}
                  </span>
                </div>
              </div>

              <div className="food-nutrition">
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.calories}</span>
                  <span className="nutrition-label">cal</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.protein}g</span>
                  <span className="nutrition-label">protein</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.carbs}g</span>
                  <span className="nutrition-label">carbs</span>
                </div>
                <div className="nutrition-item">
                  <span className="nutrition-value">{food.fat}g</span>
                  <span className="nutrition-label">fat</span>
                </div>
              </div>

              <div className="food-ayurvedic">
                <div className="ayurvedic-item">
                  <span className="ayur-label">Rasa:</span>
                  <span className="ayur-value">{food.rasa}</span>
                </div>
                <div className="ayurvedic-item">
                  <span className="ayur-label">Virya:</span>
                  <span className="ayur-value">{food.virya}</span>
                </div>
              </div>

              <div className="dosha-indicators">
                <div className="dosha-indicator">
                  <span className="dosha-name">V</span>
                  <span 
                    className="dosha-effect-indicator"
                    style={{backgroundColor: getDoshaColor(food.doshaEffects.vata)}}
                  ></span>
                </div>
                <div className="dosha-indicator">
                  <span className="dosha-name">P</span>
                  <span 
                    className="dosha-effect-indicator"
                    style={{backgroundColor: getDoshaColor(food.doshaEffects.pitta)}}
                  ></span>
                </div>
                <div className="dosha-indicator">
                  <span className="dosha-name">K</span>
                  <span 
                    className="dosha-effect-indicator"
                    style={{backgroundColor: getDoshaColor(food.doshaEffects.kapha)}}
                  ></span>
                </div>
              </div>

              <div className="food-actions">
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => {
                    setSelectedFood(food);
                    setShowDetailsModal(true);
                  }}
                >
                  View Details
                </Button>
                <select
                  value={food.status}
                  onChange={(e) => handleStatusChange(food.id, e.target.value)}
                  className="status-select"
                >
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteFood(food.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFoodItems.length === 0 && (
          <div className="no-results">
            <p>No food items found matching your criteria.</p>
          </div>
        )}
      </Card>

      {showAddModal && <AddFoodModal />}
      {showDetailsModal && <FoodDetailsModal />}
    </div>
  );
};

export default FoodDatabase;
