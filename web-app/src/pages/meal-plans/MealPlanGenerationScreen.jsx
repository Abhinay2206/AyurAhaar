import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from '../../components';
import { getPrakritiColor } from '../../utils';
import './MealPlanGeneration.css';

// Food categories and items based on the foods.csv
const foodCategories = {
  grains: [
    'Wheat Dalia', 'Tamarind Rice', 'Foxtail Millet', 'Ragi Whole', 'Bajra (Pearl Millet)',
    'Kodo Millet', 'Semolina', 'Idiyappam Flour', 'Quinoa Sprouts', 'Parboiled Rice'
  ],
  legumes: [
    'Kabuli Chana (Chickpeas)', 'Sprouted Moong', 'Sprouted Moth', 'Besan', 'Horse Gram',
    'Lobia (Black-eyed Peas)', 'Chana Dal', 'Moth Beans'
  ],
  vegetables: [
    'Medicinal Bitter Gourd', 'Pigweed', 'Banana Flower', 'Plantain Flower', 'Fern Shoots',
    'Shiitake Mushroom', 'Leek', 'Oregano', 'Potato', 'Chives', 'Fermented Bamboo Shoot'
  ],
  spices: [
    'Lal Mirch', 'Mixed Spice Powder', 'Dry Red Chilli', 'Chat Masala', 'Varuna',
    'Vietnamese Coriander', 'Rose Petals Dry', 'Parsley'
  ],
  fruits: [
    'Pineapple', 'Sweet Lime', 'Amla (Indian Gooseberry)', 'Mango', 'Banana', 'Guava', 'Papaya'
  ],
  dairy: [
    'Probiotic Dahi', 'Cow Milk', 'Buffalo Milk', 'Paneer', 'Ghee', 'Buttermilk'
  ],
  oils: [
    'Groundnut Oil', 'Coconut Oil', 'Sesame Oil', 'Mustard Oil'
  ]
};

// Prakriti-based food recommendations
const prakritiRecommendations = {
  vata: {
    recommended: ['Wheat Dalia', 'Ghee', 'Sweet Lime', 'Banana', 'Warm spices'],
    avoid: ['Dry foods', 'Cold foods', 'Bitter tastes'],
    qualities: ['Warm', 'Moist', 'Grounding', 'Nourishing']
  },
  pitta: {
    recommended: ['Cooling foods', 'Sweet fruits', 'Coconut', 'Cilantro', 'Cucumber'],
    avoid: ['Spicy foods', 'Sour foods', 'Hot foods'],
    qualities: ['Cool', 'Sweet', 'Bitter', 'Astringent']
  },
  kapha: {
    recommended: ['Light foods', 'Spices', 'Warm foods', 'Bitter vegetables'],
    avoid: ['Heavy foods', 'Sweet foods', 'Cold foods', 'Dairy'],
    qualities: ['Light', 'Warm', 'Dry', 'Stimulating']
  }
};

// Mock patient data for demo
const mockPatients = [
  {
    id: 'P0001',
    name: 'Rajesh Kumar',
    age: 56,
    prakriti: 'Kapha',
    health_conditions: 'None',
    allergies: 'None',
    weight: 76.2,
    height: 171,
    lifestyle: 'sedentary',
    preferred_cuisine: 'Chinese'
  },
  {
    id: 'P0002',
    name: 'Priya Sharma',
    age: 36,
    prakriti: 'Vata',
    health_conditions: 'Obesity',
    allergies: 'peanuts',
    weight: 61.4,
    height: 174,
    lifestyle: 'sedentary',
    preferred_cuisine: 'North Indian'
  },
  {
    id: 'P0003',
    name: 'Anita Reddy',
    age: 20,
    prakriti: 'Vata',
    health_conditions: 'Hypertension',
    allergies: 'peanuts',
    weight: 66.2,
    height: 159,
    lifestyle: 'sedentary',
    preferred_cuisine: 'North Indian'
  }
];

const MealPlanGenerationScreen = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [mealPlan, setMealPlan] = useState({});
  const [currentDay, setCurrentDay] = useState(1);
  const [generationMode, setGenerationMode] = useState('manual'); // 'manual' or 'ai'
  const [isGenerating, setIsGenerating] = useState(false);
  const [sleepTiming, setSleepTiming] = useState('10:30 PM – 6:00 AM');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize empty meal plan
  const initializeMealPlan = useCallback(() => {
    const plan = {};
    for (let day = 1; day <= 7; day++) {
      plan[day] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        restrictedFoods: []
      };
    }
    setMealPlan(plan);
  }, []);

  useEffect(() => {
    initializeMealPlan();
  }, [initializeMealPlan]);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch('');
    initializeMealPlan();
    setDoctorNotes(`Patient ${patient.id} advised to stay hydrated and exercise moderately.`);
  };

  const addFoodItem = (day, mealType, foodItem) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: [...prev[day][mealType], foodItem]
      }
    }));
  };

  const removeFoodItem = (day, mealType, index) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day][mealType].filter((_, i) => i !== index)
      }
    }));
  };

  const generateAIMealPlan = async () => {
    if (!selectedPatient) return;

    setIsGenerating(true);
    setGenerationMode('ai');

    // Simulate AI generation with realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate a sample meal plan based on patient's prakriti
    const samplePlan = {};
    for (let day = 1; day <= 7; day++) {
      samplePlan[day] = {
        breakfast: ['Wheat Dalia', 'Ghee', 'Sweet Lime'].slice(0, 2),
        lunch: ['Quinoa Sprouts', 'Mixed Spice Powder', 'Sprouted Moong'].slice(0, 3),
        dinner: ['Kodo Millet', 'Varuna', 'Medicinal Bitter Gourd'].slice(0, 2),
        snacks: ['Probiotic Dahi', 'Pineapple'].slice(0, 2),
        restrictedFoods: ['Cold foods', 'Processed foods', 'Excess sweets']
      };
    }

    setMealPlan(samplePlan);
    setIsGenerating(false);
  };

  const copyDayPlan = (fromDay, toDay) => {
    setMealPlan(prev => ({
      ...prev,
      [toDay]: { ...prev[fromDay] }
    }));
  };

  const saveMealPlan = () => {
    // Simulate saving to backend
    console.log('Saving meal plan:', {
      patient: selectedPatient,
      mealPlan,
      sleepTiming,
      doctorNotes
    });
    setShowSuccessModal(true);
  };

  const FoodSelector = ({ day, mealType, category }) => {
    const [showFoodList, setShowFoodList] = useState(false);
    const foods = foodCategories[category] || [];

    return (
      <div className="food-selector">
        <button 
          className="add-food-btn"
          onClick={() => setShowFoodList(!showFoodList)}
        >
          + Add {category}
        </button>
        {showFoodList && (
          <div className="food-dropdown">
            {foods.map((food, index) => (
              <div
                key={index}
                className="food-item"
                onClick={() => {
                  addFoodItem(day, mealType, food);
                  setShowFoodList(false);
                }}
              >
                {food}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const MealCard = ({ day, mealType, title, icon }) => (
    <Card className="meal-card">
      <div className="meal-header">
        <span className="meal-icon">{icon}</span>
        <h4>{title}</h4>
      </div>
      
      <div className="food-items">
        {mealPlan[day]?.[mealType]?.map((food, index) => (
          <div key={index} className="food-tag">
            <span>{food}</span>
            <button 
              className="remove-food"
              onClick={() => removeFoodItem(day, mealType, index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="food-selectors">
        <FoodSelector day={day} mealType={mealType} category="grains" />
        <FoodSelector day={day} mealType={mealType} category="legumes" />
        <FoodSelector day={day} mealType={mealType} category="vegetables" />
        {mealType === 'snacks' && (
          <FoodSelector day={day} mealType={mealType} category="fruits" />
        )}
      </div>
    </Card>
  );

  const DayPlanCard = ({ day }) => (
    <div className="day-plan-card">
      <div className="day-header">
        <h3>Day {day}</h3>
        <div className="day-actions">
          <select 
            onChange={(e) => e.target.value && copyDayPlan(parseInt(e.target.value), day)}
            defaultValue=""
          >
            <option value="">Copy from day...</option>
            {[1,2,3,4,5,6,7].filter(d => d !== day).map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="meals-grid">
        <MealCard day={day} mealType="breakfast" title="Breakfast" icon="🌅" />
        <MealCard day={day} mealType="lunch" title="Lunch" icon="🌞" />
        <MealCard day={day} mealType="dinner" title="Dinner" icon="🌙" />
        <MealCard day={day} mealType="snacks" title="Snacks" icon="🍎" />
      </div>

      <Card className="restrictions-card">
        <h4>🚫 Restricted Foods</h4>
        <div className="food-items">
          {mealPlan[day]?.restrictedFoods?.map((food, index) => (
            <div key={index} className="food-tag restricted">
              <span>{food}</span>
              <button 
                className="remove-food"
                onClick={() => removeFoodItem(day, 'restrictedFoods', index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <FoodSelector day={day} mealType="restrictedFoods" category="spices" />
      </Card>
    </div>
  );

  const SuccessModal = () => (
    <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
      <div className="success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">✅</div>
        <h2>Meal Plan Generated Successfully!</h2>
        <p>The 7-day personalized meal plan has been created for {selectedPatient?.name}.</p>
        <div className="modal-actions">
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            Continue
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Print Plan
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="meal-plan-generation">
      <div className="page-header">
        <div className="header-content">
          <h1>🍽️ Meal Plan Generation</h1>
          <p>Create personalized 7-day Ayurvedic meal plans for patients</p>
        </div>
      </div>

      {!selectedPatient ? (
        <Card className="patient-selection">
          <h2>Select Patient for Meal Plan</h2>
          <div className="patient-search">
            <Input
              type="text"
              placeholder="Search by patient name or ID..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              icon="🔍"
            />
          </div>
          
          <div className="patients-list">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id}
                className="patient-item"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="patient-info">
                  <h3>{patient.name}</h3>
                  <p className="patient-id">{patient.id}</p>
                </div>
                <div className="patient-details">
                  <span className="prakriti" style={{color: getPrakritiColor(patient.prakriti)}}>
                    {patient.prakriti}
                  </span>
                  <span className="age">{patient.age}y</span>
                  <span className="conditions">{patient.health_conditions}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="meal-plan-workspace">
          {/* Patient Info Header */}
          <Card className="patient-info-header">
            <div className="patient-summary">
              <div className="patient-basic">
                <h2>{selectedPatient.name}</h2>
                <span className="patient-id">{selectedPatient.id}</span>
                <button 
                  className="change-patient-btn"
                  onClick={() => setSelectedPatient(null)}
                >
                  Change Patient
                </button>
              </div>
              <div className="patient-metrics">
                <div className="metric">
                  <span className="label">Prakriti:</span>
                  <span 
                    className="value prakriti" 
                    style={{color: getPrakritiColor(selectedPatient.prakriti)}}
                  >
                    {selectedPatient.prakriti}
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Age:</span>
                  <span className="value">{selectedPatient.age} years</span>
                </div>
                <div className="metric">
                  <span className="label">Conditions:</span>
                  <span className="value">{selectedPatient.health_conditions}</span>
                </div>
                <div className="metric">
                  <span className="label">Allergies:</span>
                  <span className="value">{selectedPatient.allergies}</span>
                </div>
              </div>
            </div>

            {/* Prakriti Recommendations */}
            <div className="prakriti-recommendations">
              <h4>Ayurvedic Guidelines for {selectedPatient.prakriti}</h4>
              <div className="recommendations-grid">
                <div className="recommendation-section">
                  <span className="section-title">✅ Recommended:</span>
                  <div className="recommendation-items">
                    {prakritiRecommendations[selectedPatient.prakriti.toLowerCase()]?.recommended.map((item, index) => (
                      <span key={index} className="recommendation-tag recommended">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="recommendation-section">
                  <span className="section-title">❌ Avoid:</span>
                  <div className="recommendation-items">
                    {prakritiRecommendations[selectedPatient.prakriti.toLowerCase()]?.avoid.map((item, index) => (
                      <span key={index} className="recommendation-tag avoid">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Generation Controls */}
          <Card className="generation-controls">
            <div className="control-section">
              <h3>Generation Method</h3>
              <div className="generation-options">
                <button 
                  className={`generation-btn ${generationMode === 'ai' ? 'active' : ''}`}
                  onClick={generateAIMealPlan}
                  disabled={isGenerating}
                >
                  {isGenerating ? '🔄 Generating...' : '🤖 AI Generate'}
                </button>
                <button 
                  className={`generation-btn ${generationMode === 'manual' ? 'active' : ''}`}
                  onClick={() => setGenerationMode('manual')}
                >
                  ✋ Manual Creation
                </button>
              </div>
            </div>

            <div className="control-section">
              <h3>General Settings</h3>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Sleep Timing:</label>
                  <Input
                    value={sleepTiming}
                    onChange={(e) => setSleepTiming(e.target.value)}
                    placeholder="10:30 PM – 6:00 AM"
                  />
                </div>
                <div className="setting-item full-width">
                  <label>Doctor Notes:</label>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Additional instructions and recommendations..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Day Navigation */}
          <div className="day-navigation">
            <div className="day-tabs">
              {[1,2,3,4,5,6,7].map(day => (
                <button
                  key={day}
                  className={`day-tab ${currentDay === day ? 'active' : ''}`}
                  onClick={() => setCurrentDay(day)}
                >
                  Day {day}
                </button>
              ))}
            </div>
            <div className="plan-actions">
              <Button variant="outline" onClick={initializeMealPlan}>
                Clear All
              </Button>
              <Button variant="primary" onClick={saveMealPlan}>
                Save Plan
              </Button>
            </div>
          </div>

          {/* Current Day Plan */}
          <DayPlanCard day={currentDay} />

          {/* Weekly Overview */}
          <Card className="weekly-overview">
            <h3>📊 Weekly Overview</h3>
            <div className="overview-grid">
              {[1,2,3,4,5,6,7].map(day => (
                <div key={day} className="day-summary">
                  <h4>Day {day}</h4>
                  <div className="meal-counts">
                    <span>🌅 {mealPlan[day]?.breakfast?.length || 0}</span>
                    <span>🌞 {mealPlan[day]?.lunch?.length || 0}</span>
                    <span>🌙 {mealPlan[day]?.dinner?.length || 0}</span>
                    <span>🍎 {mealPlan[day]?.snacks?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {showSuccessModal && <SuccessModal />}
    </div>
  );
};

export default MealPlanGenerationScreen;
