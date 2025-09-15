import React, { useState } from 'react';

// Treatment Plan Details Modal Component
const TreatmentPlanModal = ({ plan, onClose, onFoodClick }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    fontFamily: "'Inter', sans-serif"
  };

  const contentStyles = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '0',
    maxWidth: '90vw',
    maxHeight: '90vh',
    width: '1000px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyles = {
    backgroundColor: '#2C5F41',
    color: 'white',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const bodyStyles = {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1
  };

  const tabStyles = {
    display: 'flex',
    gap: '2px',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  };

  const tabButtonStyle = (isActive) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#3E8E5A' : 'transparent',
    color: isActive ? 'white' : '#2C5F41',
    border: '1px solid #e5e7eb',
    borderColor: isActive ? '#3E8E5A' : '#e5e7eb',
    borderRadius: '6px 6px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '500' : '400'
  });

  const sectionStyles = {
    marginBottom: '2rem'
  };

  const sectionTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2C5F41',
    marginBottom: '1rem',
    borderBottom: '2px solid #3E8E5A',
    paddingBottom: '0.5rem'
  };

  const foodItemStyle = {
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#F3F4F6',
      borderColor: '#3E8E5A'
    }
  };

  const badgeStyle = (type) => {
    const colors = {
      'AI': { bg: '#EBF8FF', color: '#1E40AF' },
      'Doctor': { bg: '#F0FDF4', color: '#166534' },
      'Hybrid': { bg: '#FEF3C7', color: '#92400E' },
      'high': { bg: '#FEE2E2', color: '#DC2626' },
      'medium': { bg: '#FEF3C7', color: '#92400E' },
      'low': { bg: '#D1FAE5', color: '#166534' }
    };
    
    const style = colors[type] || { bg: '#F3F4F6', color: '#6B7280' };
    
    return {
      backgroundColor: style.bg,
      color: style.color,
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    };
  };

  const renderOverviewTab = () => (
    <div>
      <div style={sectionStyles}>
        <h3 style={sectionTitleStyles}>Plan Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <strong>Plan ID:</strong> {plan.planId}
          </div>
          <div>
            <strong>Type:</strong> <span style={badgeStyle(plan.planType)}>{plan.planType}</span>
          </div>
          <div>
            <strong>Status:</strong> <span style={badgeStyle(plan.status)}>{plan.status}</span>
          </div>
          <div>
            <strong>Duration:</strong> {plan.duration}
          </div>
          <div>
            <strong>Version:</strong> {plan.version}
          </div>
          <div>
            <strong>Created:</strong> {new Date(plan.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div style={sectionStyles}>
        <h3 style={sectionTitleStyles}>Patient Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <strong>Name:</strong> {plan.patient?.name || plan.patientName}
          </div>
          <div>
            <strong>Email:</strong> {plan.patient?.email || plan.patientEmail}
          </div>
          <div>
            <strong>Phone:</strong> {plan.patient?.phone || plan.patientPhone}
          </div>
          <div>
            <strong>Age:</strong> {plan.patient?.age || 'N/A'}
          </div>
        </div>
      </div>

      <div style={sectionStyles}>
        <h3 style={sectionTitleStyles}>Medical Information</h3>
        {plan.diagnosis && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Diagnosis:</strong>
            <p style={{ margin: '0.5rem 0', padding: '0.75rem', backgroundColor: '#FEF2F2', borderRadius: '6px' }}>
              {plan.diagnosis}
            </p>
          </div>
        )}
        {plan.symptoms && plan.symptoms.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Symptoms:</strong>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              {plan.symptoms.map((symptom, index) => (
                <li key={index}>{symptom}</li>
              ))}
            </ul>
          </div>
        )}
        {plan.objectives && plan.objectives.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <strong>Treatment Objectives:</strong>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
              {plan.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {plan.description && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Description</h3>
          <p style={{ lineHeight: '1.6', color: '#4B5563' }}>{plan.description}</p>
        </div>
      )}
    </div>
  );

  const renderDietaryTab = () => (
    <div>
      {/* Handle AI plans from Patient model */}
      {plan.weeklyPlan && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>AI Generated Weekly Plan</h3>
          {Object.entries(plan.weeklyPlan).map(([day, meals]) => (
            <div key={day} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: '#2C5F41', 
                fontSize: '1.1rem',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '0.5rem'
              }}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {Object.entries(meals).map(([mealType, mealItems]) => (
                  <div key={mealType} style={{
                    backgroundColor: '#F9FAFB',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <h5 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#4B5563',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {mealType.replace('_', ' ')}
                    </h5>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {Array.isArray(mealItems) ? (
                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                          {mealItems.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '0.25rem' }}>
                              {typeof item === 'string' ? item : item.name || 'Food Item'}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span>{typeof mealItems === 'string' ? mealItems : 'No items'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Handle TreatmentPlan format dietary recommendations */}
      {plan.dietaryRecommendations && plan.dietaryRecommendations.length > 0 && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Dietary Recommendations</h3>
          {plan.dietaryRecommendations.map((rec, index) => (
            <div 
              key={index} 
              style={foodItemStyle}
              onClick={() => onFoodClick && onFoodClick(rec.foodId)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2C5F41' }}>
                    {rec.foodId?.name_en || 'Food Item'}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '14px' }}>
                    <div><strong>Quantity:</strong> {rec.quantity}</div>
                    <div><strong>Frequency:</strong> {rec.frequency}</div>
                    <div><strong>Timing:</strong> {rec.timing}</div>
                  </div>
                  {rec.notes && (
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6B7280' }}>
                      {rec.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {plan.mealPlan && plan.mealPlan.length > 0 && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Meal Plan</h3>
          {plan.mealPlan.map((day, dayIndex) => (
            <div key={dayIndex} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: '#2C5F41', 
                fontSize: '1.1rem',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '0.5rem'
              }}>
                {day.day}
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {['breakfast', 'lunch', 'dinner', 'snacks'].map(mealType => (
                  day[mealType] && day[mealType].length > 0 && (
                    <div key={mealType}>
                      <h5 style={{ 
                        margin: '0 0 0.5rem 0', 
                        color: '#3E8E5A', 
                        textTransform: 'capitalize',
                        fontSize: '1rem'
                      }}>
                        {mealType}
                      </h5>
                      {day[mealType].map((food, foodIndex) => (
                        <div 
                          key={foodIndex}
                          style={{
                            ...foodItemStyle,
                            marginBottom: '4px',
                            padding: '8px'
                          }}
                          onClick={() => onFoodClick && onFoodClick(food.foodId)}
                        >
                          <div style={{ fontSize: '14px' }}>
                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                              {food.foodId?.name_en || 'Food Item'}
                            </div>
                            <div style={{ color: '#6B7280' }}>
                              {food.quantity} - {food.frequency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLifestyleTab = () => (
    <div>
      {plan.lifestyleRecommendations && plan.lifestyleRecommendations.length > 0 && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Lifestyle Recommendations</h3>
          {plan.lifestyleRecommendations.map((rec, index) => (
            <div key={index} style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#2C5F41', textTransform: 'capitalize' }}>
                  {rec.category}
                </h4>
                <span style={badgeStyle(rec.priority)}>{rec.priority}</span>
              </div>
              <p style={{ margin: '8px 0', lineHeight: '1.5' }}>{rec.recommendation}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#6B7280' }}>
                {rec.duration && <div><strong>Duration:</strong> {rec.duration}</div>}
                {rec.frequency && <div><strong>Frequency:</strong> {rec.frequency}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {plan.herbalRecommendations && plan.herbalRecommendations.length > 0 && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Herbal Recommendations</h3>
          {plan.herbalRecommendations.map((herb, index) => (
            <div key={index} style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#166534' }}>{herb.name}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '14px' }}>
                <div><strong>Dosage:</strong> {herb.dosage}</div>
                <div><strong>Frequency:</strong> {herb.frequency}</div>
                {herb.duration && <div><strong>Duration:</strong> {herb.duration}</div>}
              </div>
              {herb.notes && (
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#059669' }}>
                  {herb.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {plan.generalInstructions && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>General Instructions</h3>
          <p style={{ 
            lineHeight: '1.6', 
            backgroundColor: '#F0F9FF', 
            padding: '1rem', 
            borderRadius: '8px',
            border: '1px solid #BAE6FD'
          }}>
            {plan.generalInstructions}
          </p>
        </div>
      )}

      {plan.precautions && plan.precautions.length > 0 && (
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Precautions</h3>
          <div style={{ 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FECACA', 
            borderRadius: '8px', 
            padding: '1rem' 
          }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {plan.precautions.map((precaution, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>{precaution}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={modalStyles} onClick={onClose}>
      <div style={contentStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{plan.title}</h2>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '14px' }}>
              {plan.patient?.name || plan.patientName} - {plan.planType} Plan
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={bodyStyles}>
          <div style={tabStyles}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={tabButtonStyle(activeTab === 'overview')}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('dietary')}
              style={tabButtonStyle(activeTab === 'dietary')}
            >
              Diet & Meals
            </button>
            <button 
              onClick={() => setActiveTab('lifestyle')}
              style={tabButtonStyle(activeTab === 'lifestyle')}
            >
              Lifestyle & Herbs
            </button>
          </div>

          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'dietary' && renderDietaryTab()}
          {activeTab === 'lifestyle' && renderLifestyleTab()}
        </div>
      </div>
    </div>
  );
};

// Food Details Modal Component
const FoodDetailsModal = ({ food, onClose }) => {
  const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
    fontFamily: "'Inter', sans-serif"
  };

  const contentStyles = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '0',
    maxWidth: '600px',
    width: '90vw',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyles = {
    backgroundColor: '#3E8E5A',
    color: 'white',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const bodyStyles = {
    padding: '1.5rem',
    overflowY: 'auto'
  };

  return (
    <div style={modalStyles} onClick={onClose}>
      <div style={contentStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{food.name_en}</h2>
            {food.vernacular_names && (
              <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '14px' }}>
                {food.vernacular_names}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={bodyStyles}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#2C5F41', marginBottom: '1rem' }}>Nutritional Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>
                  {food.calories_kcal || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>Calories (kcal)</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>
                  {food.protein_g || 0}g
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>Protein</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>
                  {food.carbs_g || 0}g
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>Carbohydrates</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                  {food.fats_g || 0}g
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>Fats</div>
              </div>
            </div>
          </div>

          {food.category && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#2C5F41', marginBottom: '0.5rem' }}>Category</h4>
              <span style={{
                backgroundColor: '#E0F2FE',
                color: '#0C4A6E',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {food.category}
              </span>
            </div>
          )}

          {food.food_id && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ color: '#2C5F41', marginBottom: '0.5rem' }}>Food ID</h4>
              <code style={{
                backgroundColor: '#F3F4F6',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                {food.food_id}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { TreatmentPlanModal, FoodDetailsModal };