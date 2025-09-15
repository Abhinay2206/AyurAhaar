import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '../../components';
import ApiService from '../../services/api';
import { TreatmentPlanModal, FoodDetailsModal } from './TreatmentPlanModals';
import ConsultationPage from '../consultations/ConsultationPage';

const TreatmentPlansScreen = () => {
  const [patients, setPatients] = useState([]);
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients'); // patients, plans
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showFoodDetails, setShowFoodDetails] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [error, setError] = useState(null);
  const [showConsultationPage, setShowConsultationPage] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    planType: 'all',
    search: ''
  });

  // Fetch patients with consultations and treatment plans
  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.getPatientsWithConsultations({
        page: 1,
        limit: 50,
        search: filters.search
      });

      const data = response.data || response;
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters.search]);

  // Fetch treatment plans
  const fetchTreatmentPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryFilters = {
        page: 1,
        limit: 50,
        search: filters.search
      };

      if (filters.status !== 'all') queryFilters.status = filters.status;
      if (filters.planType !== 'all') queryFilters.planType = filters.planType;

      const response = await ApiService.getAllTreatmentPlans(queryFilters);
      const data = response.data || response;
      setTreatmentPlans(data.treatmentPlans || []);
    } catch (err) {
      console.error('Error fetching treatment plans:', err);
      setError('Failed to load treatment plans. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters.search, filters.status, filters.planType]);

  useEffect(() => {
    if (activeTab === 'patients') {
      fetchPatients();
    } else {
      fetchTreatmentPlans();
    }
  }, [activeTab, filters, fetchPatients, fetchTreatmentPlans]);

  const handleViewPlan = async (plan) => {
    try {
      const response = await ApiService.getTreatmentPlanById(plan.id);
      setSelectedPlan(response.data || response);
      setShowPlanModal(true);
    } catch (err) {
      console.error('Error fetching plan details:', err);
      alert('Failed to load plan details');
    }
  };

  const handleEditPlan = (plan) => {
    // Navigate to meal plan creation in edit mode
    const url = `/meal-plan-creation?patientId=${plan.patientId}&planId=${plan.id}&mode=edit`;
    window.open(url, '_blank');
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this treatment plan?')) {
      return;
    }

    try {
      await ApiService.deleteTreatmentPlan(planId);
      alert('Treatment plan deleted successfully');
      fetchTreatmentPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Failed to delete treatment plan');
    }
  };

  const handleFoodClick = async (foodId) => {
    try {
      const response = await ApiService.getFoodById(foodId);
      setSelectedFood(response.data || response);
      setShowFoodDetails(true);
    } catch (err) {
      console.error('Error fetching food details:', err);
      alert('Failed to load food details');
    }
  };

  const handleStartConsultation = async (patient) => {
    try {
      // First update the consultation status in the backend
      await ApiService.startConsultation(patient._id);
      
      // Create a consultation object similar to what ConsultationPage expects
      const consultation = {
        _id: `consultation_${patient._id}`, // Generate a temporary ID
        patientId: patient._id,
        patientName: patient.name,
        patientEmail: patient.email,
        patientPhone: patient.phone,
        patient: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          age: patient.age,
          weight: patient.weight || patient.bodyWeight,
          height: patient.height
        },
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        status: 'consulting',
        type: 'follow-up'
      };

      setSelectedConsultation(consultation);
      setShowConsultationPage(true);
      
      // Refresh patient list to show updated status
      await fetchPatients();
      
      console.log('Consultation started successfully');
    } catch (err) {
      console.error('Error starting consultation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to start consultation';
      alert(errorMessage);
    }
  };

  const handleViewConsultation = (patient) => {
    // Create a consultation object to view ongoing consultation
    const consultation = {
      _id: `consultation_${patient._id}`,
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      patientPhone: patient.phone,
      patient: {
        _id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        weight: patient.weight || patient.bodyWeight,
        height: patient.height
      },
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      status: 'consulting',
      type: 'follow-up'
    };

    setSelectedConsultation(consultation);
    setShowConsultationPage(true);
  };

  const handleCompleteConsultation = async (patientId) => {
    if (!window.confirm('Are you sure you want to complete this consultation?')) {
      return;
    }

    try {
      await ApiService.completeConsultation(patientId);
      alert('Consultation completed successfully');
      
      // Refresh patient list to show updated status
      await fetchPatients();
      
      console.log('Consultation completed successfully');
    } catch (err) {
      console.error('Error completing consultation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to complete consultation';
      alert(errorMessage);
    }
  };

  const handleCreatePlan = (patientId) => {
    // Navigate to meal plan creation page for the specific patient
    const url = `/meal-plan-creation?patientId=${patientId}`;
    window.open(url, '_blank');
  };

  const handleGeneratePlan = async () => {
    try {
      // Navigate to meal plan creation with consultation data
      if (selectedConsultation && selectedConsultation.patientId) {
        const url = `/meal-plan-creation?patientId=${selectedConsultation.patientId}&consultationId=${selectedConsultation._id}`;
        window.open(url, '_blank');
      } else {
        throw new Error('Patient information not found');
      }
    } catch (error) {
      console.error('Error redirecting to plan creation:', error);
      alert('Failed to open plan creation page');
    }
  };

  const containerStyles = {
    padding: '1rem',
    backgroundColor: '#F5F7FA',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyles = {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2C5F41',
    margin: 0,
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const tabStyles = {
    display: 'flex',
    gap: '2px',
    marginBottom: '1rem',
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
    fontFamily: "'Inter', sans-serif",
    fontWeight: isActive ? '500' : '400'
  });

  const filterStyles = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    alignItems: 'center'
  };

  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white'
  };

  const searchInputStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    minWidth: '200px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  };

  const badgeStyle = (type) => {
    const colors = {
      'AI': { bg: '#EBF8FF', color: '#1E40AF' },
      'Doctor': { bg: '#F0FDF4', color: '#166534' },
      'Hybrid': { bg: '#FEF3C7', color: '#92400E' },
      'active': { bg: '#D1FAE5', color: '#166534' },
      'draft': { bg: '#FEF3C7', color: '#92400E' },
      'completed': { bg: '#DBEAFE', color: '#1E40AF' },
      'cancelled': { bg: '#FEE2E2', color: '#DC2626' }
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

  const buttonStyle = {
    backgroundColor: '#3E8E5A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    marginRight: '8px'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#DC2626'
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          fontSize: '16px',
          color: '#687076'
        }}>
          Loading treatment plans...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>Treatment Plans</h1>
          <p style={{
            color: '#687076',
            fontSize: '14px',
            margin: '4px 0 0 0',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            Manage patient treatment plans and consultation outcomes
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={tabStyles}>
        <button 
          onClick={() => setActiveTab('patients')}
          style={tabButtonStyle(activeTab === 'patients')}
        >
          Patients with Consultations
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          style={tabButtonStyle(activeTab === 'plans')}
        >
          Treatment Plans
        </button>
      </div>

      {/* Filters */}
      <div style={filterStyles}>
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={searchInputStyle}
        />
        
        {activeTab === 'plans' && (
          <>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={selectStyle}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.planType}
              onChange={(e) => setFilters({ ...filters, planType: e.target.value })}
              style={selectStyle}
            >
              <option value="all">All Types</option>
              <option value="AI">AI Generated</option>
              <option value="Doctor">Doctor Created</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEE2E2',
          color: '#DC2626',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Content */}
      {activeTab === 'patients' ? (
        <div>
          {patients.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#687076'
            }}>
              No patients with consultations found.
            </div>
          ) : (
            patients.map((patient) => (
              <div key={patient._id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#2C5F41' 
                    }}>
                      {patient.name}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div><strong>Email:</strong> {patient.email}</div>
                      <div><strong>Phone:</strong> {patient.phone}</div>
                      <div><strong>Total Consultations:</strong> {patient.totalConsultations}</div>
                      <div><strong>Treatment Plans:</strong> {patient.totalPlans}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {patient.hasCompletedConsultations && (
                        <span style={badgeStyle('completed')}>Has Completed Consultations</span>
                      )}
                      {patient.hasConsultationInProgress && (
                        <span style={badgeStyle('active')}>Currently Consulting</span>
                      )}
                      {(patient.hasTreatmentPlans || patient.hasAIPlan) && (
                        <span style={badgeStyle('AI')}>Has Treatment Plans</span>
                      )}
                      {patient.hasAIPlan && (
                        <span style={badgeStyle('AI')}>AI Plan Available</span>
                      )}
                    </div>

                    {patient.latestConsultation && (
                      <div style={{ fontSize: '14px', color: '#687076' }}>
                        <strong>Latest Consultation:</strong> {new Date(patient.latestConsultation.date).toLocaleDateString()} - {patient.latestConsultation.status}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                      style={buttonStyle}
                      onClick={() => {
                        // View patient treatment plans
                        setActiveTab('plans');
                        setFilters({ ...filters, search: patient.name });
                      }}
                    >
                      View Plans
                    </button>
                    
                    {patient.hasConsultationInProgress ? (
                      <>
                        <button 
                          style={buttonStyle}
                          onClick={() => handleViewConsultation(patient)}
                        >
                          View Consultation
                        </button>
                        <button 
                          style={buttonStyle}
                          onClick={() => handleCreatePlan(patient._id)}
                        >
                          Create Plan
                        </button>
                        <button 
                          style={dangerButtonStyle}
                          onClick={() => handleCompleteConsultation(patient._id)}
                        >
                          Complete Consultation
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          style={buttonStyle}
                          onClick={() => handleStartConsultation(patient)}
                        >
                          Start Consulting
                        </button>
                        <button 
                          style={buttonStyle}
                          onClick={() => handleCreatePlan(patient._id)}
                        >
                          Create Plan
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {treatmentPlans.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#687076'
            }}>
              No treatment plans found.
            </div>
          ) : (
            treatmentPlans.map((plan) => (
              <div key={plan.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#2C5F41' 
                      }}>
                        {plan.title}
                      </h3>
                      <span style={badgeStyle(plan.planType)}>{plan.planType}</span>
                      <span style={badgeStyle(plan.status)}>{plan.status}</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <div><strong>Patient:</strong> {plan.patientName}</div>
                      <div><strong>Doctor:</strong> {plan.doctorName}</div>
                      <div><strong>Duration:</strong> {plan.duration}</div>
                      <div><strong>Version:</strong> {plan.version}</div>
                    </div>

                    {plan.description && (
                      <p style={{ 
                        margin: '8px 0', 
                        color: '#687076', 
                        fontSize: '14px',
                        lineHeight: '1.4'
                      }}>
                        {plan.description}
                      </p>
                    )}

                    {plan.diagnosis && (
                      <div style={{ fontSize: '14px', color: '#DC2626', marginBottom: '8px' }}>
                        <strong>Diagnosis:</strong> {plan.diagnosis}
                      </div>
                    )}

                    <div style={{ fontSize: '14px', color: '#687076' }}>
                      Created: {new Date(plan.createdAt).toLocaleDateString()}
                      {plan.updatedAt !== plan.createdAt && (
                        <span> | Updated: {new Date(plan.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                      style={buttonStyle}
                      onClick={() => handleViewPlan(plan)}
                    >
                      View Details
                    </button>
                    <button 
                      style={buttonStyle}
                      onClick={() => handleEditPlan(plan)}
                    >
                      Edit
                    </button>
                    <button 
                      style={dangerButtonStyle}
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Treatment Plan Details Modal */}
      {showPlanModal && selectedPlan && (
        <TreatmentPlanModal 
          plan={selectedPlan}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedPlan(null);
          }}
          onFoodClick={handleFoodClick}
        />
      )}

      {/* Food Details Modal */}
      {showFoodDetails && selectedFood && (
        <FoodDetailsModal 
          food={selectedFood}
          onClose={() => {
            setShowFoodDetails(false);
            setSelectedFood(null);
          }}
        />
      )}

      {/* Consultation Page */}
      {showConsultationPage && selectedConsultation && (
        <ConsultationPage
          consultation={selectedConsultation}
          onClose={() => {
            setShowConsultationPage(false);
            setSelectedConsultation(null);
          }}
          onGeneratePlan={handleGeneratePlan}
        />
      )}
    </div>
  );
};

export default TreatmentPlansScreen;