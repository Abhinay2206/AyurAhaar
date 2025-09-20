import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '../../components';
import ApiService from '../../services/api';
import ConsultationPage from './ConsultationPage';

// Helper function to determine appointment status and actions
const getAppointmentStatus = (consultation) => {
  const appointmentDate = new Date(consultation.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);
  
  const isPastDate = appointmentDate < today;
  const isToday = appointmentDate.getTime() === today.getTime();
  const isFuture = appointmentDate > today;
  
  // Determine status and available actions
  if (isPastDate && consultation.status !== 'completed' && consultation.status !== 'consulting') {
    return {
      status: 'completed_without_consultation',
      displayStatus: 'COMPLETED WITHOUT CONSULTATION',
      canStart: false,
      canReschedule: true,
      message: 'This appointment date has passed. You can reschedule for a new consultation.'
    };
  }
  
  if (consultation.status === 'completed') {
    return {
      status: 'completed',
      displayStatus: 'COMPLETED',
      canStart: false,
      canReschedule: true,
      message: 'Consultation completed. You can reschedule for a follow-up if needed.'
    };
  }
  
  if (consultation.status === 'consulting') {
    return {
      status: 'consulting',
      displayStatus: 'IN PROGRESS',
      canStart: true,
      canReschedule: false,
      message: 'Consultation is currently in progress.'
    };
  }
  
  if ((isToday || isFuture) && (consultation.status === 'confirmed' || consultation.status === 'pending')) {
    return {
      status: 'ready',
      displayStatus: consultation.status?.toUpperCase(),
      canStart: true,
      canReschedule: true,
      message: isToday ? 'Ready to start consultation.' : 'Upcoming appointment.'
    };
  }
  
  return {
    status: consultation.status,
    displayStatus: consultation.status?.toUpperCase(),
    canStart: false,
    canReschedule: true,
    message: 'Appointment status needs review.'
  };
};

// Minimal Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizes = {
    small: '500px',
    medium: '800px',
    large: '1200px',
    xlarge: '1400px'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        width: '95%',
        maxWidth: sizes[size],
        maxHeight: '95vh',
        overflow: 'hidden',
        border: '1px solid #dee2e6'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#212529',
            fontFamily: "'Inter', sans-serif"
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ 
          padding: '20px',
          overflow: 'auto',
          maxHeight: 'calc(95vh - 80px)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const ConsultationDetailsModal = ({ consultation, onClose, onStartConsulting, setShowRescheduleModal }) => {
  const [surveyData, setSurveyData] = useState(null);
  const [prakritiData, setPrakritiData] = useState(null);
  const [prakritiResponses, setPrakritiResponses] = useState(null); // eslint-disable-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!consultation.patientId) {
        console.log('❌ No patient ID found in consultation:', consultation);
        return;
      }
      
      try {
        setLoading(true);
        console.log('🔄 Fetching comprehensive patient data for ID:', consultation.patientId);
        
        // Fetch all patient data in parallel
        const [surveyResponse, prakritiResponse] = await Promise.all([
          ApiService.getPatientSurveyData(consultation.patientId),
          ApiService.getPatientPrakritiData(consultation.patientId)
        ]);
        
        console.log('📋 Survey response:', surveyResponse);
        console.log('🧘 Prakriti response:', prakritiResponse);
        
        setSurveyData(surveyResponse.data);
        setPrakritiData(prakritiResponse.data);
        
        // Try to fetch detailed responses if prakriti is completed
        if (prakritiResponse.data?.prakritiCompleted) {
          try {
            const detailedResponses = await ApiService.getPatientPrakritiResponses(consultation.patientId);
            setPrakritiResponses(detailedResponses.data);
            console.log('📝 Detailed prakriti responses:', detailedResponses);
          } catch (responseError) { // eslint-disable-line no-unused-vars
            console.log('⚠️ Could not fetch detailed responses, using basic data');
          }
        }
        
        console.log('✅ Modal patient data loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching patient data in modal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [consultation]);

  const TabButton = ({ tabKey, label, isActive, onClick }) => (
    <button 
      onClick={() => onClick(tabKey)}
      style={{
        padding: '12px 20px',
        backgroundColor: isActive ? '#059669' : 'transparent',
        color: isActive ? 'white' : '#374151',
        border: 'none',
        borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
        cursor: 'pointer',
        fontSize: '14px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s ease',
        borderRadius: '6px 6px 0 0',
        margin: '0 2px'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.backgroundColor = '#f3f4f6';
          e.target.style.color = '#059669';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#374151';
        }
      }}
    >
      {label}
    </button>
  );

  const InfoCard = ({ title, children, icon = null }) => (
    <div style={{
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '16px',
        borderBottom: '1px solid #f3f4f6',
        paddingBottom: '12px'
      }}>
        {icon && <span style={{ marginRight: '8px', fontSize: '20px' }}>{icon}</span>}
        <h3 style={{ 
          color: '#1f2937', 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '600',
          fontFamily: "'Inter', sans-serif"
        }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const DataRow = ({ label, value, important = false }) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginBottom: '8px',
      padding: important ? '8px 12px' : '4px 0',
      backgroundColor: important ? '#f8fafc' : 'transparent',
      borderRadius: important ? '6px' : '0',
      border: important ? '1px solid #e2e8f0' : 'none'
    }}>
      <span style={{ 
        fontWeight: '500', 
        color: '#4b5563',
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px'
      }}>
        {label}:
      </span>
      <span style={{ 
        color: important ? '#059669' : '#1f2937',
        fontWeight: important ? '600' : '400',
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        textAlign: 'right',
        maxWidth: '60%'
      }}>
        {value || 'Not available'}
      </span>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={`Patient Consultation - ${consultation.patientName}`} size="xlarge">
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '24px',
          borderBottom: '2px solid #f3f4f6',
          backgroundColor: '#fafafa',
          borderRadius: '8px 8px 0 0',
          padding: '8px'
        }}>
          <TabButton tabKey="overview" label="📋 Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton tabKey="survey" label="📝 Health Survey" isActive={activeTab === 'survey'} onClick={setActiveTab} />
          <TabButton tabKey="prakriti" label="🧘 Prakriti Assessment" isActive={activeTab === 'prakriti'} onClick={setActiveTab} />
          <TabButton tabKey="consultation" label="🩺 Consultation Notes" isActive={activeTab === 'consultation'} onClick={setActiveTab} />
        </div>

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px',
            color: '#6b7280' 
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <h3 style={{ color: '#374151', marginBottom: '8px' }}>Loading Patient Data</h3>
            <p>Please wait while we fetch comprehensive patient information...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InfoCard title="Patient Information" icon="👤">
                  <DataRow label="Full Name" value={consultation.patientName} important={true} />
                  <DataRow label="Email" value={consultation.patientEmail} />
                  <DataRow label="Phone" value={consultation.patientPhone} />
                  <DataRow label="Patient ID" value={consultation.patientId} />
                </InfoCard>
                
                <InfoCard title="Appointment Details" icon="📅">
                  <DataRow label="Date" value={new Date(consultation.date).toLocaleDateString()} important={true} />
                  <DataRow label="Time" value={consultation.time} important={true} />
                  <DataRow label="Duration" value={consultation.duration} />
                  <DataRow label="Consultation Fee" value={consultation.consultationFee ? `₹${consultation.consultationFee}` : 'N/A'} />
                  <DataRow label="Status" value={getAppointmentStatus(consultation).displayStatus} important={true} />
                  {getAppointmentStatus(consultation).message && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      {getAppointmentStatus(consultation).message}
                    </div>
                  )}
                </InfoCard>
                
                <InfoCard title="Medical Information" icon="🏥">
                  <DataRow label="Consultation Type" value={consultation.type} important={true} />
                  <DataRow label="Diagnosis" value={consultation.diagnosis} />
                  <DataRow label="Doctor" value={consultation.doctorName} />
                </InfoCard>

                <InfoCard title="Assessment Status" icon="📊">
                  <DataRow 
                    label="Health Survey" 
                    value={surveyData?.surveyCompleted ? '✅ Completed' : '❌ Not Completed'} 
                    important={true}
                  />
                  <DataRow 
                    label="Prakriti Assessment" 
                    value={prakritiData?.prakritiCompleted ? '✅ Completed' : '❌ Not Completed'} 
                    important={true}
                  />
                  {prakritiData?.assessmentData?.dominantDosha && (
                    <DataRow 
                      label="Dominant Dosha" 
                      value={prakritiData.assessmentData.dominantDosha} 
                      important={true}
                    />
                  )}
                </InfoCard>

                <div style={{ gridColumn: '1 / -1' }}>
                  <InfoCard title="Consultation Notes" icon="📝">
                    <div style={{ 
                      padding: '16px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      minHeight: '100px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}>
                      {consultation.notes || 'No consultation notes available yet.'}
                    </div>
                  </InfoCard>
                </div>
              </div>
            )}

            {/* Health Survey Tab */}
            {activeTab === 'survey' && (
              <div>
                {surveyData?.surveyCompleted ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <InfoCard title="Physical Metrics" icon="📏">
                      <DataRow label="Age" value={`${surveyData.surveyData.age || 'N/A'} years`} important={true} />
                      <DataRow label="Weight" value={`${surveyData.surveyData.weight || 'N/A'} kg`} important={true} />
                      <DataRow label="Height" value={`${surveyData.surveyData.height || 'N/A'} cm`} important={true} />
                      <DataRow label="BMI" value={surveyData.surveyData.bmi} important={true} />
                      <DataRow label="Lifestyle" value={surveyData.surveyData.lifestyle} />
                    </InfoCard>
                    
                    <InfoCard title="Health Profile" icon="🏥">
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>Allergies</h4>
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#fef3f2', 
                          borderRadius: '6px',
                          border: '1px solid #fed7d7'
                        }}>
                          {surveyData.surveyData.allergies?.length > 0 
                            ? surveyData.surveyData.allergies.join(', ')
                            : 'No allergies reported'
                          }
                        </div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>Health Conditions</h4>
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#fff7ed', 
                          borderRadius: '6px',
                          border: '1px solid #fed7aa'
                        }}>
                          {surveyData.surveyData.healthConditions?.length > 0 
                            ? surveyData.surveyData.healthConditions.join(', ')
                            : 'No health conditions reported'
                          }
                        </div>
                      </div>
                      <div>
                        <h4 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>Preferred Cuisine</h4>
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#f0fdf4', 
                          borderRadius: '6px',
                          border: '1px solid #bbf7d0'
                        }}>
                          {surveyData.surveyData.preferredCuisine?.length > 0 
                            ? surveyData.surveyData.preferredCuisine.join(', ')
                            : 'Not specified'
                          }
                        </div>
                      </div>
                    </InfoCard>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px',
                    color: '#6b7280',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
                    <h3 style={{ color: '#374151', marginBottom: '12px', fontSize: '20px' }}>Health Survey Not Completed</h3>
                    <p style={{ fontSize: '16px', marginBottom: '0' }}>The patient has not completed their comprehensive health survey yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Prakriti Assessment Tab */}
            {activeTab === 'prakriti' && (
              <div>
                {prakritiData?.prakritiCompleted ? (
                  <div>
                    {/* Assessment Overview */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      <InfoCard title="Primary Results" icon="🎯">
                        <DataRow label="Dominant Dosha" value={prakritiData.assessmentData?.dominantDosha} important={true} />
                        <DataRow label="Prakriti Type" value={prakritiData.assessmentData?.prakritiType} important={true} />
                        <DataRow label="Assessment Date" value={
                          prakritiData.assessmentData?.completedAt 
                            ? new Date(prakritiData.assessmentData.completedAt).toLocaleDateString()
                            : 'N/A'
                        } />
                      </InfoCard>
                      
                      <InfoCard title="Dosha Distribution" icon="⚖️">
                        {prakritiData.assessmentData?.scores && (
                          <div>
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '500', color: '#7c2d12' }}>Vata</span>
                                <span style={{ fontWeight: '600', color: '#7c2d12' }}>{prakritiData.assessmentData.scores.vata || 0}%</span>
                              </div>
                              <div style={{ 
                                width: '100%', 
                                height: '8px', 
                                backgroundColor: '#fed7aa', 
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${prakritiData.assessmentData.scores.vata || 0}%`, 
                                  height: '100%', 
                                  backgroundColor: '#ea580c',
                                  borderRadius: '4px'
                                }} />
                              </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '500', color: '#dc2626' }}>Pitta</span>
                                <span style={{ fontWeight: '600', color: '#dc2626' }}>{prakritiData.assessmentData.scores.pitta || 0}%</span>
                              </div>
                              <div style={{ 
                                width: '100%', 
                                height: '8px', 
                                backgroundColor: '#fecaca', 
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${prakritiData.assessmentData.scores.pitta || 0}%`, 
                                  height: '100%', 
                                  backgroundColor: '#dc2626',
                                  borderRadius: '4px'
                                }} />
                              </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '500', color: '#059669' }}>Kapha</span>
                                <span style={{ fontWeight: '600', color: '#059669' }}>{prakritiData.assessmentData.scores.kapha || 0}%</span>
                              </div>
                              <div style={{ 
                                width: '100%', 
                                height: '8px', 
                                backgroundColor: '#bbf7d0', 
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${prakritiData.assessmentData.scores.kapha || 0}%`, 
                                  height: '100%', 
                                  backgroundColor: '#059669',
                                  borderRadius: '4px'
                                }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </InfoCard>

                      <InfoCard title="Key Characteristics" icon="✨">
                        {prakritiData.assessmentData?.characteristics && (
                          <div style={{ 
                            padding: '12px', 
                            backgroundColor: '#f0f9ff', 
                            borderRadius: '8px',
                            border: '1px solid #bae6fd'
                          }}>
                            {prakritiData.assessmentData.characteristics.join(', ')}
                          </div>
                        )}
                      </InfoCard>
                    </div>

                    {/* Detailed Responses */}
                    {prakritiData.assessmentData?.responses && (
                      <InfoCard title="Detailed Assessment Responses" icon="📋">
                        <div style={{ 
                          display: 'grid', 
                          gap: '16px',
                          maxHeight: '400px',
                          overflowY: 'auto',
                          padding: '8px'
                        }}>
                          {prakritiData.assessmentData.responses.map((response, index) => (
                            <div key={index} style={{
                              padding: '16px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: '#374151', fontSize: '14px' }}>
                                  Q{index + 1}: {response.questionText}
                                </strong>
                              </div>
                              <div style={{
                                padding: '8px 12px',
                                backgroundColor: '#ecfdf5',
                                borderRadius: '6px',
                                border: '1px solid #bbf7d0',
                                fontSize: '14px',
                                color: '#065f46'
                              }}>
                                <strong>Answer:</strong> {response.answerText}
                              </div>
                              {response.category && (
                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                                  <em>Category: {response.category}</em>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </InfoCard>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px',
                    color: '#6b7280',
                    backgroundColor: '#fafafa',
                    borderRadius: '12px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧘</div>
                    <h3 style={{ color: '#374151', marginBottom: '12px', fontSize: '20px' }}>Prakriti Assessment Not Completed</h3>
                    <p style={{ fontSize: '16px', marginBottom: '0' }}>The patient has not completed their Ayurvedic constitution assessment yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Consultation Notes Tab */}
            {activeTab === 'consultation' && (
              <div>
                <InfoCard title="Current Consultation Notes" icon="📝">
                  <div style={{ 
                    padding: '20px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    minHeight: '200px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#374151',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {consultation.notes || 'No consultation notes have been added yet. Click "Start Consulting" or "Continue Consultation" to add clinical observations and treatment recommendations.'}
                  </div>
                </InfoCard>

                <InfoCard title="Consultation History" icon="📚">
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#fafafa', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                    <p style={{ margin: 0 }}>Previous consultation records will appear here.</p>
                  </div>
                </InfoCard>
              </div>
            )}
          </>
        )}

        {/* Professional Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '2px solid #f3f4f6'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e5e7eb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            Close
          </button>
          
          {/* Smart Button Logic Based on Appointment Status */}
          {(() => {
            const appointmentStatus = getAppointmentStatus(consultation);
            
            if (appointmentStatus.canStart && appointmentStatus.status === 'ready') {
              return (
                <button
                  onClick={() => {
                    onClose();
                    onStartConsulting(consultation);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#047857';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(5, 150, 105, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#059669';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(5, 150, 105, 0.3)';
                  }}
                >
                  🩺 Start Consultation
                </button>
              );
            }
            
            if (appointmentStatus.canStart && appointmentStatus.status === 'consulting') {
              return (
                <button
                  onClick={() => {
                    onClose();
                    onStartConsulting(consultation);
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d97706';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f59e0b';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  📋 Continue Consultation
                </button>
              );
            }
            
            return null; // No start button for completed/past appointments
          })()}
          
          {/* Reschedule Button - Available for most statuses */}
          {getAppointmentStatus(consultation).canReschedule && (
            <button
              onClick={() => {
                setShowRescheduleModal(true);
                // Don't close this modal - let user see both
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#047857';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(99, 102, 241, 0.3)';
              }}
            >
              📅 Reschedule
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
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

  const handleEditNotesClick = (consultation) => {
    setSelectedConsultation(consultation);
    setShowEditNotesModal(true);
  };

  const handleSmartEditClick = (consultation) => {
    const appointmentStatus = getAppointmentStatus(consultation);
    
    // For completed without consultation - open reschedule modal
    if (appointmentStatus.status === 'completed_without_consultation') {
      setSelectedConsultation(consultation);
      setShowRescheduleModal(true);
    } else {
      // For regular appointments - open edit notes modal
      handleEditNotesClick(consultation);
    }
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

  // Filter and sort consultations based on search query and priority
  const filteredConsultations = consultations.filter(consultation => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'confirmed' && (consultation.status === 'confirmed' || consultation.status === 'pending')) ||
      consultation.status === activeFilter;
    
    const matchesSearch = !searchQuery || 
      consultation.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    // Get appointment status for both consultations
    const statusA = getAppointmentStatus(a);
    const statusB = getAppointmentStatus(b);
    
    // Define priority order: scheduled > completed_without_consultation > cancelled > others
    const getPriority = (status) => {
      if (status.status === 'ready' || status.status === 'consulting') return 1; // Scheduled appointments
      if (status.status === 'completed_without_consultation') return 2;
      if (a.status === 'cancelled' || b.status === 'cancelled') return 3;
      if (status.status === 'completed') return 4;
      return 5; // Other statuses
    };
    
    const priorityA = getPriority(statusA);
    const priorityB = getPriority(statusB);
    
    // First sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Within same priority, sort by date and time (earliest first)
    const dateA = new Date(a.date + ' ' + (a.time || '00:00'));
    const dateB = new Date(b.date + ' ' + (b.time || '00:00'));
    
    return dateA - dateB;
  });

  const containerStyles = {
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyles = {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  };

  const titleStyles = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2C5F41',
    margin: '0 0 4px 0',
    fontFamily: "'Inter', sans-serif"
  };

  const controlsStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '16px'
  };

  const searchBarStyles = {
    flex: 1,
    maxWidth: '400px',
    position: 'relative'
  };

  const filterStyles = {
    display: 'flex',
    gap: '2px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    padding: '2px'
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
        {/* Minimal Header */}
        <div style={headerStyles}>
          <h1 style={titleStyles}>Consultations</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Manage patient consultations
          </p>
        </div>

        {/* Search and Controls */}
        <div style={controlsStyles}>
          {/* Search Bar */}
          <div style={searchBarStyles}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search patients, type, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 1px #6366f1';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: '16px'
              }}>
                🔍
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '2px', backgroundColor: '#f9fafb', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'list' ? '#e2e8f0' : 'transparent',
                color: viewMode === 'list' ? '#374151' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              � List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'grid' ? '#e2e8f0' : 'transparent',
                color: viewMode === 'grid' ? '#374151' : '#6b7280',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              ⊞ Grid
            </button>
          </div>

          {/* Minimal Filter Tabs */}
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
                  backgroundColor: activeFilter === filter.key ? '#e2e8f0' : 'transparent',
                  color: activeFilter === filter.key ? '#374151' : '#6b7280',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  boxShadow: activeFilter === filter.key ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px',
            margin: '12px 0',
            color: '#dc2626',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
            <button 
              onClick={() => fetchConsultations(1, activeFilter)}
              style={{
                marginLeft: 'auto',
                padding: '4px 8px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Consultation List/Grid */}
        <div style={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
          flexDirection: viewMode === 'list' ? 'column' : 'none',
          gap: '12px'
        }}>
          {filteredConsultations.map(consultation => (
            viewMode === 'list' ? (
              // List View - Minimal Row
              <div
                key={consultation.id}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '2px'
                      }}>
                        {consultation.patientName}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        {new Date(consultation.date).toLocaleDateString()} • {consultation.time}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#374151',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {consultation.type}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: '600',
                      color: (() => {
                        const appointmentStatus = getAppointmentStatus(consultation);
                        if (appointmentStatus.status === 'completed_without_consultation') return '#dc2626';
                        if (appointmentStatus.status === 'ready') return '#f59e0b';
                        if (appointmentStatus.status === 'consulting') return '#dc2626';
                        if (appointmentStatus.status === 'completed') return '#059669';
                        return '#6b7280';
                      })(),
                      backgroundColor: (() => {
                        const appointmentStatus = getAppointmentStatus(consultation);
                        if (appointmentStatus.status === 'completed_without_consultation') return '#dc262615';
                        if (appointmentStatus.status === 'ready') return '#f59e0b15';
                        if (appointmentStatus.status === 'consulting') return '#dc262615';
                        if (appointmentStatus.status === 'completed') return '#05966915';
                        return '#6b728015';
                      })(),
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {getAppointmentStatus(consultation).displayStatus}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(consultation);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      View
                    </button>
                    
                    {/* Smart button logic based on appointment status */}
                    {(() => {
                      const appointmentStatus = getAppointmentStatus(consultation);
                      
                      // For completed without consultation - only show edit (reschedule)
                      if (appointmentStatus.status === 'completed_without_consultation') {
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSmartEditClick(consultation);
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontFamily: "'Inter', sans-serif"
                            }}
                          >
                            Reschedule
                          </button>
                        );
                      }
                      
                      // For regular appointments - show all buttons
                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSmartEditClick(consultation);
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'transparent',
                              color: '#6b7280',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontFamily: "'Inter', sans-serif"
                            }}
                          >
                            Edit
                          </button>
                          
                          {appointmentStatus.canStart && appointmentStatus.status === 'ready' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartConsulting(consultation);
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontFamily: "'Inter', sans-serif"
                              }}
                            >
                              Start
                            </button>
                          )}
                          
                          {appointmentStatus.canStart && appointmentStatus.status === 'consulting' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartConsulting(consultation);
                              }}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontFamily: "'Inter', sans-serif"
                              }}
                            >
                              Continue
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              // Grid View - Minimal Card
              <div
                key={consultation.id}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    {consultation.patientName}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '6px'
                  }}>
                    {new Date(consultation.date).toLocaleDateString()} • {consultation.time}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {consultation.type}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: (() => {
                      const appointmentStatus = getAppointmentStatus(consultation);
                      if (appointmentStatus.status === 'completed_without_consultation') return '#dc2626';
                      if (appointmentStatus.status === 'ready') return '#f59e0b';
                      if (appointmentStatus.status === 'consulting') return '#dc2626';
                      if (appointmentStatus.status === 'completed') return '#059669';
                      return '#6b7280';
                    })(),
                    backgroundColor: (() => {
                      const appointmentStatus = getAppointmentStatus(consultation);
                      if (appointmentStatus.status === 'completed_without_consultation') return '#dc262615';
                      if (appointmentStatus.status === 'ready') return '#f59e0b15';
                      if (appointmentStatus.status === 'consulting') return '#dc262615';
                      if (appointmentStatus.status === 'completed') return '#05966915';
                      return '#6b728015';
                    })(),
                    padding: '3px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {getAppointmentStatus(consultation).displayStatus}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(consultation);
                      }}
                      style={{
                        padding: '4px 6px',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #e5e7eb',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      👁️
                    </button>
                    
                    {/* Smart button logic based on appointment status */}
                    {(() => {
                      const appointmentStatus = getAppointmentStatus(consultation);
                      
                      // For completed without consultation - only show reschedule
                      if (appointmentStatus.status === 'completed_without_consultation') {
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSmartEditClick(consultation);
                            }}
                            style={{
                              padding: '4px 6px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                          >
                            📅
                          </button>
                        );
                      }
                      
                      // For regular appointments - show all buttons
                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSmartEditClick(consultation);
                            }}
                            style={{
                              padding: '4px 6px',
                              backgroundColor: 'transparent',
                              color: '#6b7280',
                              border: '1px solid #e5e7eb',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '10px'
                            }}
                          >
                            ✏️
                          </button>
                          
                          {appointmentStatus.canStart && appointmentStatus.status === 'ready' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartConsulting(consultation);
                              }}
                              style={{
                                padding: '4px 6px',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              ▶️
                            </button>
                          )}
                          
                          {appointmentStatus.canStart && appointmentStatus.status === 'consulting' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartConsulting(consultation);
                              }}
                              style={{
                                padding: '4px 6px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              ⏯️
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Minimal Empty State */}
        {filteredConsultations.length === 0 && !isLoading && !error && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <p style={{ fontSize: '14px', margin: 0 }}>
              {searchQuery ? `No consultations found for "${searchQuery}"` : 'No consultations found'}
            </p>
          </div>
        )}

        {/* Modals remain the same */}
        {showDetailsModal && selectedConsultation && (
          <ConsultationDetailsModal 
            consultation={selectedConsultation}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedConsultation(null);
            }}
            onStartConsulting={handleStartConsulting}
            setShowRescheduleModal={setShowRescheduleModal}
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