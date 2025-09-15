import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '../../components';
import ApiService from '../../services/api';
import ConsultationPage from './ConsultationPage';

// Modal Components
const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizes = {
    small: '400px',
    medium: '600px',
    large: '800px',
    xlarge: '1000px'
  };

  return (
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
        borderRadius: '8px',
        width: '90%',
        maxWidth: sizes[size],
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#2C5F41',
            fontFamily: "'Inter', sans-serif"
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#687076',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const ConsultationDetailsModal = ({ consultation, onClose, onStartConsulting }) => {
  const [surveyData, setSurveyData] = useState(null);
  const [prakritiData, setPrakritiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointment');

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!consultation.patientId) {
        console.log('❌ No patient ID found in consultation:', consultation);
        return;
      }
      
      try {
        setLoading(true);
        console.log('🔄 Fetching patient data for ID:', consultation.patientId);
        
        // Fetch survey and prakriti data in parallel
        const [surveyResponse, prakritiResponse] = await Promise.all([
          ApiService.getPatientSurveyData(consultation.patientId),
          ApiService.getPatientPrakritiData(consultation.patientId)
        ]);
        
        console.log('📋 Survey response:', surveyResponse);
        console.log('🧘 Prakriti response:', prakritiResponse);
        
        setSurveyData(surveyResponse.data);
        setPrakritiData(prakritiResponse.data);
        console.log('✅ Modal patient data loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching patient data in modal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [consultation]);

  const tabStyle = (isActive) => ({
    padding: '8px 16px',
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

  return (
    <Modal isOpen={true} onClose={onClose} title={`Consultation Details - ${consultation.patientName}`} size="xlarge">
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '2px', 
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button 
            onClick={() => setActiveTab('appointment')}
            style={tabStyle(activeTab === 'appointment')}
          >
            Appointment Info
          </button>
          <button 
            onClick={() => setActiveTab('survey')}
            style={tabStyle(activeTab === 'survey')}
          >
            Survey Details
          </button>
          <button 
            onClick={() => setActiveTab('prakriti')}
            style={tabStyle(activeTab === 'prakriti')}
          >
            Prakriti Assessment
          </button>
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#687076' 
          }}>
            Loading patient data...
          </div>
        ) : (
          <>
            {/* Appointment Info Tab */}
            {activeTab === 'appointment' && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px' 
              }}>
                <div>
                  <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Patient Information</h3>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Name:</strong> {consultation.patientName}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Email:</strong> {consultation.patientEmail || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Phone:</strong> {consultation.patientPhone || 'N/A'}
                  </div>
                </div>
                
                <div>
                  <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Appointment Details</h3>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Date:</strong> {new Date(consultation.date).toLocaleDateString()}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Time:</strong> {consultation.time}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Duration:</strong> {consultation.duration}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Fee:</strong> ₹{consultation.consultationFee || 'N/A'}
                  </div>
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Medical Information</h3>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Type:</strong> {consultation.type}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Diagnosis:</strong> {consultation.diagnosis || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Notes:</strong> 
                    <div style={{ 
                      marginTop: '4px', 
                      padding: '8px', 
                      backgroundColor: '#f9fafb', 
                      borderRadius: '4px',
                      minHeight: '60px'
                    }}>
                      {consultation.notes || 'No notes available'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Survey Details Tab */}
            {activeTab === 'survey' && (
              <div>
                {surveyData?.surveyCompleted ? (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '20px' 
                  }}>
                    <div>
                      <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Physical Details</h3>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Age:</strong> {surveyData.surveyData.age || 'N/A'} years
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Weight:</strong> {surveyData.surveyData.weight || 'N/A'} kg
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Height:</strong> {surveyData.surveyData.height || 'N/A'} cm
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>BMI:</strong> {surveyData.surveyData.bmi || 'N/A'}
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Lifestyle:</strong> {surveyData.surveyData.lifestyle || 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Health Information</h3>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Allergies:</strong> 
                        <div style={{ marginTop: '4px' }}>
                          {surveyData.surveyData.allergies?.length > 0 
                            ? surveyData.surveyData.allergies.join(', ')
                            : 'None reported'
                          }
                        </div>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Health Conditions:</strong>
                        <div style={{ marginTop: '4px' }}>
                          {surveyData.surveyData.healthConditions?.length > 0 
                            ? surveyData.surveyData.healthConditions.join(', ')
                            : 'None reported'
                          }
                        </div>
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Preferred Cuisine:</strong>
                        <div style={{ marginTop: '4px' }}>
                          {surveyData.surveyData.preferredCuisine?.length > 0 
                            ? surveyData.surveyData.preferredCuisine.join(', ')
                            : 'Not specified'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#687076',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ color: '#2C5F41', marginBottom: '8px' }}>Survey Not Completed</h3>
                    <p>The patient has not completed their health survey yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Prakriti Assessment Tab */}
            {activeTab === 'prakriti' && (
              <div>
                {prakritiData?.prakritiCompleted ? (
                  <div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Assessment Results</h3>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Dominant Dosha:</strong> {prakritiData.assessmentData?.dominantDosha || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Prakriti Type:</strong> {prakritiData.assessmentData?.prakritiType || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Completed:</strong> {prakritiData.assessmentData?.completedAt 
                            ? new Date(prakritiData.assessmentData.completedAt).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                      </div>
                      
                      <div>
                        <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Dosha Scores</h3>
                        {prakritiData.assessmentData?.scores && (
                          <div>
                            <div style={{ marginBottom: '4px' }}>
                              <strong>Vata:</strong> {prakritiData.assessmentData.scores.vata || 0}%
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <strong>Pitta:</strong> {prakritiData.assessmentData.scores.pitta || 0}%
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                              <strong>Kapha:</strong> {prakritiData.assessmentData.scores.kapha || 0}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {prakritiData.assessmentData?.characteristics && (
                      <div>
                        <h3 style={{ color: '#2C5F41', marginBottom: '12px', fontSize: '16px' }}>Characteristics</h3>
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#f9fafb', 
                          borderRadius: '8px' 
                        }}>
                          {prakritiData.assessmentData.characteristics.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#687076',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧘</div>
                    <h3 style={{ color: '#2C5F41', marginBottom: '8px' }}>Prakriti Assessment Not Completed</h3>
                    <p>The patient has not completed their Prakriti assessment yet.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Close
          </button>
          {(consultation.status === 'confirmed' || consultation.status === 'pending') && (
            <button
              onClick={() => {
                onClose();
                onStartConsulting(consultation);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3E8E5A',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '500'
              }}
            >
              Start Consulting
            </button>
          )}
          {consultation.status === 'consulting' && (
            <button
              onClick={() => {
                onClose();
                onStartConsulting(consultation);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F4A261',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '500'
              }}
            >
              Continue Consultation
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

const RescheduleModal = ({ consultation, onClose, onReschedule }) => {
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onReschedule(consultation.id, rescheduleData);
      onClose();
    } catch {
      setError('Failed to reschedule appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Reschedule Appointment - ${consultation.patientName}`} size="medium">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              New Date
            </label>
            <input
              type="date"
              required
              value={rescheduleData.date}
              onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              New Time
            </label>
            <input
              type="time"
              required
              value={rescheduleData.time}
              onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}
            />
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '4px',
            border: '1px solid #bae6fd'
          }}>
            <strong>Current appointment:</strong> {new Date(consultation.date).toLocaleDateString()} at {consultation.time}
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#9ca3af' : '#3E8E5A',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {loading ? 'Rescheduling...' : 'Reschedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const EditNotesModal = ({ consultation, onClose, onSave }) => {
  const [notes, setNotes] = useState(consultation.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSave(consultation, notes);
      onClose();
    } catch {
      setError('Failed to update notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Edit Notes - ${consultation.patientName}`} size="medium">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Consultation Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter consultation notes..."
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '4px',
            border: '1px solid #bae6fd'
          }}>
            <strong>Appointment:</strong> {new Date(consultation.date).toLocaleDateString()} at {consultation.time}
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#9ca3af' : '#3E8E5A',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {loading ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const ConsultationsScreen = () => {
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [showConsultationPage, setShowConsultationPage] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  // Fetch consultations from API
  const fetchConsultations = useCallback(async (page = 1, status = activeFilter) => {
    try {
      setIsLoading(true);
      setError(null);

      const filters = {
        page,
        limit: pagination.limit,
        sortBy: 'priority' // This will sort scheduled first, then completed
      };

      if (status !== 'all') {
        filters.status = status === 'scheduled' ? 'confirmed' : status;
      }

      const response = await ApiService.getAllConsultations(filters);
      const data = response.data || response;

      setConsultations(data.appointments || []);
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.total || 0,
        limit: data.pagination?.limit || 10
      });
    } catch (err) {
      console.error('Error fetching consultations:', err);
      setError('Failed to load consultations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, pagination.limit]);

  useEffect(() => {
    fetchConsultations(1, activeFilter);
  }, [activeFilter, fetchConsultations]);

  const handleViewDetails = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
  };

  const handleStartConsulting = async (consultation) => {
    try {
      // First, check if consultation is already in progress or update backend if needed
      if (consultation.status === 'confirmed' || consultation.status === 'pending') {
        // Start a new consultation session in the backend
        await ApiService.startConsultation(consultation.patientId);
      }
      
      // Enhance the consultation object with proper patient information
      const enhancedConsultation = {
        ...consultation,
        patientId: consultation.patientId,
        patientName: consultation.patientName,
        patientEmail: consultation.patientEmail,
        patientPhone: consultation.patientPhone,
        patient: {
          _id: consultation.patientId,
          name: consultation.patientName,
          email: consultation.patientEmail,
          phone: consultation.patientPhone
        },
        status: 'consulting', // Update status to consulting
        type: consultation.type || 'consultation'
      };
      
      console.log('🔍 Starting consultation with data:', enhancedConsultation);
      
      setSelectedConsultation(enhancedConsultation);
      setShowDetailsModal(false);
      setShowConsultationPage(true);
      
      // Refresh consultations to show updated status
      fetchConsultations(pagination.currentPage, activeFilter);
      
    } catch (error) {
      console.error('Error starting consultation:', error);
      
      // Even if backend call fails, still open consultation page with available data
      const enhancedConsultation = {
        ...consultation,
        patientId: consultation.patientId,
        patientName: consultation.patientName,
        patientEmail: consultation.patientEmail,
        patientPhone: consultation.patientPhone,
        patient: {
          _id: consultation.patientId,
          name: consultation.patientName,
          email: consultation.patientEmail,
          phone: consultation.patientPhone
        },
        status: 'consulting',
        type: consultation.type || 'consultation'
      };
      
      console.log('🔍 Opening consultation despite error with data:', enhancedConsultation);
      
      setSelectedConsultation(enhancedConsultation);
      setShowDetailsModal(false);
      setShowConsultationPage(true);
    }
  };

  const handleReschedule = async (consultationId, rescheduleData) => {
    await ApiService.rescheduleAppointment(consultationId, rescheduleData);
    // Refresh the consultations list
    await fetchConsultations(pagination.currentPage, activeFilter);
  };

  const handleGeneratePlan = async (planData) => {
    try {
      // Save consultation notes first
      if (planData.notes || planData.symptoms || planData.diagnosis || planData.recommendations) {
        const updateData = {
          notes: planData.notes,
          symptoms: planData.symptoms,
          diagnosis: planData.diagnosis,
          recommendations: planData.recommendations,
          status: 'completed'
        };
        
        await ApiService.updateAppointmentNotes(selectedConsultation.id, updateData);
      }
      
      // Navigate to meal plan creation
      if (selectedConsultation && selectedConsultation.patientId) {
        const url = `/meal-plan-creation?patientId=${selectedConsultation.patientId}&consultationId=${selectedConsultation.id}`;
        window.open(url, '_blank');
      } else {
        throw new Error('Patient information not found');
      }
    } catch (error) {
      console.error('Error saving consultation or redirecting:', error);
      alert('Failed to save consultation notes or open plan creation page');
    }
  };

  const handleRescheduleClick = (consultation) => {
    setSelectedConsultation(consultation);
    setShowRescheduleModal(true);
  };

  const handleEditNotesClick = (consultation) => {
    setSelectedConsultation(consultation);
    setShowEditNotesModal(true);
  };

  const handleEditNotes = async (consultation, newNotes) => {
    try {
      await ApiService.updateAppointmentNotes(consultation.id, { notes: newNotes });
      
      // Update the consultation in local state
      setConsultations(prevConsultations => 
        prevConsultations.map(c => 
          c.id === consultation.id ? { ...c, notes: newNotes } : c
        )
      );
      
      console.log('Notes updated successfully');
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const filteredConsultations = consultations;

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

  const filterStyles = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem'
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: '#F4A261', // Scheduled/Confirmed
      pending: '#F4A261',   // Pending (also scheduled)
      consulting: '#E85D04', // Currently consulting
      completed: '#3E8E5A', // Completed
      cancelled: '#DC3545'  // Cancelled
    };
    return colors[status] || '#687076';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      confirmed: 'Scheduled',
      pending: 'Pending',
      consulting: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
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
          Loading consultations...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>Consultations</h1>
          <p style={{
            color: '#687076', 
            fontSize: '14px', 
            margin: '4px 0 0 0', 
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            Manage patient consultations and appointments
          </p>
        </div>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#3E8E5A',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            fontWeight: '500'
          }}
        >
          New Consultation
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '16px',
          margin: '16px 0',
          color: '#c33',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => fetchConsultations(1, activeFilter)}
            style={{
              marginLeft: '12px',
              padding: '6px 12px',
              backgroundColor: '#3E8E5A',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div style={filterStyles}>
        {[
          { key: 'all', label: 'All' },
          { key: 'confirmed', label: 'Scheduled' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            style={{
              padding: '6px 12px',
              backgroundColor: activeFilter === filter.key ? '#3E8E5A' : 'transparent',
              color: activeFilter === filter.key ? 'white' : '#2C5F41',
              border: '1px solid #e5e7eb',
              borderColor: activeFilter === filter.key ? '#3E8E5A' : '#e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: activeFilter === filter.key ? '500' : '400'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {filteredConsultations.map(consultation => (
          <div
            key={consultation.id} 
            style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              e.target.style.borderColor = '#3E8E5A';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '12px' 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#2C5F41', 
                  margin: '0 0 4px 0',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {consultation.patientName}
                </h3>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#687076',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {new Date(consultation.date).toLocaleDateString()} • {consultation.time} • {consultation.duration}
                </div>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(consultation.status)}20`,
                color: getStatusColor(consultation.status)
              }}>
                {getStatusDisplay(consultation.status).toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#2C5F41', 
                marginBottom: '4px',
                fontFamily: "'Inter', sans-serif"
              }}>
                Type: {consultation.type}
              </div>
              {consultation.diagnosis && (
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#2C5F41', 
                  marginBottom: '4px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Diagnosis: {consultation.diagnosis}
                </div>
              )}
              {consultation.doctorName && (
                <div style={{ 
                  fontSize: '14px', 
                  color: '#687076', 
                  marginBottom: '4px',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Doctor: {consultation.doctorName}
                </div>
              )}
            </div>

            <div style={{ 
              fontSize: '14px', 
              color: '#687076', 
              marginBottom: '16px',
              fontFamily: "'Inter', sans-serif"
            }}>
              {consultation.notes || 'No notes available'}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(consultation);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: '#3E8E5A',
                  border: '1px solid #3E8E5A',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditNotesClick(consultation);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#687076',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Edit Notes
              </button>
              {(consultation.status === 'confirmed' || consultation.status === 'pending') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRescheduleClick(consultation);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#F4A261',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Reschedule
                </button>
              )}
              {consultation.status === 'consulting' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartConsulting(consultation);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#E85D04',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  Continue Consultation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredConsultations.length === 0 && !isLoading && !error && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🩺</div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#2C5F41', 
            marginBottom: '8px',
            fontFamily: "'Inter', sans-serif"
          }}>
            No consultations found
          </h3>
          <p style={{ 
            color: '#687076', 
            marginBottom: '24px',
            fontFamily: "'Inter', sans-serif"
          }}>
            No consultations match the selected filter.
          </p>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#3E8E5A',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '500'
            }}
          >
            Schedule New Consultation
          </button>
        </div>
      )}

      {/* Modals */}
      {showDetailsModal && selectedConsultation && (
        <ConsultationDetailsModal 
          consultation={selectedConsultation}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedConsultation(null);
          }}
          onStartConsulting={handleStartConsulting}
        />
      )}

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

      {showRescheduleModal && selectedConsultation && (
        <RescheduleModal 
          consultation={selectedConsultation}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedConsultation(null);
          }}
          onReschedule={handleReschedule}
        />
      )}

      {showEditNotesModal && selectedConsultation && (
        <EditNotesModal 
          consultation={selectedConsultation}
          onClose={() => {
            setShowEditNotesModal(false);
            setSelectedConsultation(null);
          }}
          onSave={handleEditNotes}
        />
      )}
    </div>
  );
};

export default ConsultationsScreen;