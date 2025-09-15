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

  // Professional styling consistent with dashboard and patient management
  const containerStyles = {
    padding: '0.75rem',
    backgroundColor: '#F5F7FA',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyles = {
    marginBottom: '1rem',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, #3E8E5A 0%, #4A9D6A 100%)',
    borderRadius: '12px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(62, 142, 90, 0.2)',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const subtitleStyles = {
    fontSize: '0.9rem',
    opacity: 0.9,
    marginBottom: '0.75rem',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

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
      <div style={{ position: 'relative' }}>
        <button 
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            color: '#374151',
            fontSize: '0.75rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            textTransform: 'capitalize'
          }}
          onClick={() => setShowFoodList(!showFoodList)}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.borderColor = '#3E8E5A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
          }}
        >
          + Add {category}
        </button>
        {showFoodList && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 10,
            backgroundColor: '#ffffff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {foods.map((food, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderBottom: index < foods.length - 1 ? '1px solid #F3F4F6' : 'none',
                  transition: 'background-color 0.2s ease',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}
                onClick={() => {
                  addFoodItem(day, mealType, food);
                  setShowFoodList(false);
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#F3F4F6';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
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
    <Card style={{
      padding: '1rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E5E7EB',
      backgroundColor: '#ffffff',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <span style={{
          fontSize: '1.25rem',
          filter: 'brightness(1.1)'
        }}>
          {icon}
        </span>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#2C5F41',
          margin: 0,
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          {title}
        </h4>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem',
        minHeight: '60px'
      }}>
        {mealPlan[day]?.[mealType]?.map((food, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem',
            backgroundColor: '#F3F4F6',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            <span style={{ color: '#374151' }}>{food}</span>
            <button 
              style={{
                background: 'none',
                border: 'none',
                color: '#DC2626',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '0.25rem'
              }}
              onClick={() => removeFoodItem(day, mealType, index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
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
    <div style={{
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E5E7EB',
      marginBottom: '1rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#2C5F41',
          margin: 0,
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Day {day}
        </h3>
        <select 
          onChange={(e) => e.target.value && copyDayPlan(parseInt(e.target.value), day)}
          defaultValue=""
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            backgroundColor: '#ffffff',
            fontSize: '0.875rem',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            cursor: 'pointer'
          }}
        >
          <option value="">Copy from day...</option>
          {[1,2,3,4,5,6,7].filter(d => d !== day).map(d => (
            <option key={d} value={d}>Day {d}</option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <MealCard day={day} mealType="breakfast" title="Breakfast" icon="☀" />
        <MealCard day={day} mealType="lunch" title="Lunch" icon="◐" />
        <MealCard day={day} mealType="dinner" title="Dinner" icon="☾" />
        <MealCard day={day} mealType="snacks" title="Snacks" icon="●" />
      </div>

      <Card style={{
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FEF2F2'
      }}>
        <h4 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          color: '#DC2626',
          margin: 0,
          marginBottom: '1rem',
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          ⊗ Restricted Foods
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1rem',
          minHeight: '40px'
        }}>
          {mealPlan[day]?.restrictedFoods?.map((food, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem',
              backgroundColor: '#FEE2E2',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              <span style={{ color: '#991B1B' }}>{food}</span>
              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  padding: '0.25rem'
                }}
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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }} onClick={() => setShowSuccessModal(false)}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        maxWidth: '400px',
        width: '100%',
        margin: '1rem',
        textAlign: 'center'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          ✓
        </div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#2C5F41',
          marginBottom: '0.5rem',
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Meal Plan Generated Successfully!
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: '#687076',
          marginBottom: '2rem',
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          The 7-day personalized meal plan has been created for {selectedPatient?.name}.
        </p>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center'
        }}>
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
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={titleStyles}>
          <span>⚕</span>
          Meal Plan Generation
        </div>
        <p style={subtitleStyles}>
          Create personalized 7-day Ayurvedic meal plans for patients
        </p>
      </div>

      {!selectedPatient ? (
        <Card style={{
          marginBottom: '1rem',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2C5F41',
            marginBottom: '1rem',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            Select Patient for Meal Plan
          </h2>
          <div style={{ marginBottom: '1rem' }}>
            <Input
              type="text"
              placeholder="Search by patient name or ID..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              }
            />
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {filteredPatients.map(patient => (
              <div 
                key={patient.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    borderColor: '#3E8E5A',
                    boxShadow: '0 2px 8px rgba(62, 142, 90, 0.1)'
                  }
                }}
                onClick={() => handlePatientSelect(patient)}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#3E8E5A';
                  e.target.style.boxShadow = '0 2px 8px rgba(62, 142, 90, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: 0,
                      marginBottom: '0.25rem',
                      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    }}>
                      {patient.name}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#687076',
                      margin: 0,
                      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    }}>
                      {patient.id}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <span style={{
                      color: getPrakritiColor(patient.prakriti),
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    }}>
                      {patient.prakriti}
                    </span>
                    <span style={{
                      color: '#687076',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    }}>
                      {patient.age}y
                    </span>
                    <span style={{
                      color: '#687076',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    }}>
                      {patient.health_conditions}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Patient Info Header */}
          <Card style={{
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            backgroundColor: '#ffffff'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#2C5F41',
                  margin: 0,
                  marginBottom: '0.25rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {selectedPatient.name}
                </h2>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#687076',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {selectedPatient.id}
                </span>
              </div>
              <Button 
                variant="outline"
                size="small"
                onClick={() => setSelectedPatient(null)}
              >
                Change Patient
              </Button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <span style={{
                  color: '#687076',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  Prakriti:
                </span>
                <span style={{
                  color: getPrakritiColor(selectedPatient.prakriti),
                  fontWeight: '600',
                  marginLeft: '0.5rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {selectedPatient.prakriti}
                </span>
              </div>
              <div>
                <span style={{
                  color: '#687076',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  Age:
                </span>
                <span style={{
                  color: '#374151',
                  marginLeft: '0.5rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {selectedPatient.age} years
                </span>
              </div>
              <div>
                <span style={{
                  color: '#687076',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  Conditions:
                </span>
                <span style={{
                  color: '#374151',
                  marginLeft: '0.5rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {selectedPatient.health_conditions}
                </span>
              </div>
              <div>
                <span style={{
                  color: '#687076',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  Allergies:
                </span>
                <span style={{
                  color: '#374151',
                  marginLeft: '0.5rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {selectedPatient.allergies}
                </span>
              </div>
            </div>

            {/* Prakriti Recommendations */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C5F41',
                marginBottom: '0.75rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Ayurvedic Guidelines for {selectedPatient.prakriti}
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#059669',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}>
                    ✓ Recommended:
                  </span>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem'
                  }}>
                    {prakritiRecommendations[selectedPatient.prakriti.toLowerCase()]?.recommended.map((item, index) => (
                      <span key={index} style={{
                        backgroundColor: '#D1FAE5',
                        color: '#065F46',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#DC2626',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}>
                    ✗ Avoid:
                  </span>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem'
                  }}>
                    {prakritiRecommendations[selectedPatient.prakriti.toLowerCase()]?.avoid.map((item, index) => (
                      <span key={index} style={{
                        backgroundColor: '#FEE2E2',
                        color: '#991B1B',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Generation Controls */}
          <Card style={{
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C5F41',
                marginBottom: '1rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Generation Method
              </h3>
              <div style={{
                display: 'flex',
                gap: '0.75rem'
              }}>
                <button 
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${generationMode === 'ai' ? '#3E8E5A' : '#E5E7EB'}`,
                    backgroundColor: generationMode === 'ai' ? '#3E8E5A' : '#ffffff',
                    color: generationMode === 'ai' ? '#ffffff' : '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={generateAIMealPlan}
                  disabled={isGenerating}
                >
                  {isGenerating ? '⟳' : '🤖'} {isGenerating ? 'Generating...' : 'AI Generate'}
                </button>
                <button 
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: `2px solid ${generationMode === 'manual' ? '#3E8E5A' : '#E5E7EB'}`,
                    backgroundColor: generationMode === 'manual' ? '#3E8E5A' : '#ffffff',
                    color: generationMode === 'manual' ? '#ffffff' : '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={() => setGenerationMode('manual')}
                >
                  ✋ Manual Creation
                </button>
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C5F41',
                marginBottom: '1rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                General Settings
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}>
                    Sleep Timing:
                  </label>
                  <Input
                    value={sleepTiming}
                    onChange={(e) => setSleepTiming(e.target.value)}
                    placeholder="10:30 PM – 6:00 AM"
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    display: 'block',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}>
                    Doctor Notes:
                  </label>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Additional instructions and recommendations..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      ':focus': {
                        borderColor: '#3E8E5A'
                      }
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3E8E5A'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Day Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              {[1,2,3,4,5,6,7].map(day => (
                <button
                  key={day}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: `2px solid ${currentDay === day ? '#3E8E5A' : '#E5E7EB'}`,
                    backgroundColor: currentDay === day ? '#3E8E5A' : '#ffffff',
                    color: currentDay === day ? '#ffffff' : '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontSize: '0.875rem'
                  }}
                  onClick={() => setCurrentDay(day)}
                >
                  Day {day}
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
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
          <Card style={{
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#2C5F41',
              marginBottom: '1rem',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ■ Weekly Overview
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem'
            }}>
              {[1,2,3,4,5,6,7].map(day => (
                <div key={day} style={{
                  padding: '1rem',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  textAlign: 'center'
                }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: 0,
                    marginBottom: '0.5rem',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}>
                    Day {day}
                  </h4>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    fontSize: '0.75rem',
                    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                  }}>
                    <span title="Breakfast">☀ {mealPlan[day]?.breakfast?.length || 0}</span>
                    <span title="Lunch">◐ {mealPlan[day]?.lunch?.length || 0}</span>
                    <span title="Dinner">☾ {mealPlan[day]?.dinner?.length || 0}</span>
                    <span title="Snacks">● {mealPlan[day]?.snacks?.length || 0}</span>
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
