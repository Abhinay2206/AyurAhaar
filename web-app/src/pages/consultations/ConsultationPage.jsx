import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api';

const ConsultationPage = ({ consultation, onClose, onGeneratePlan }) => {
  const [patientData, setPatientData] = useState({
    survey: null,
    prakriti: null,
    personal: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
  // Modern features
  const [activeTab, setActiveTab] = useState('overview');
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: ''
  });
  const [quickActions, setQuickActions] = useState({
    prescriptionSent: false,
    followUpScheduled: false,
    labOrderSent: false,
    referralMade: false
  });
  const [consultationTimer, setConsultationTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Professional templates for quick input
  const consultationTemplates = {
    symptoms: [
      'Headache and fatigue',
      'Digestive issues',
      'Joint pain and stiffness',
      'Sleep disturbances',
      'Stress and anxiety',
      'Chronic fatigue',
      'Skin issues',
      'Weight management concerns'
    ],
    diagnoses: [
      'Vata imbalance',
      'Pitta imbalance', 
      'Kapha imbalance',
      'Digestive weakness (Mandagni)',
      'Stress-related disorder',
      'Constitutional imbalance',
      'Lifestyle-related issues',
      'Seasonal adjustment needed'
    ],
    recommendations: [
      'Follow Vata-pacifying diet',
      'Increase Pitta-cooling foods',
      'Reduce Kapha-aggravating foods',
      'Practice daily meditation',
      'Establish regular sleep routine',
      'Increase physical activity',
      'Herbal supplements as prescribed',
      'Regular follow-up in 2 weeks'
    ]
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setConsultationTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      console.log('🔍 ConsultationPage mounted with consultation:', consultation);
      
      const patientId = consultation?.patientId || consultation?.patient?._id || consultation?.patient;
      
      if (!patientId) {
        console.log('❌ No patient ID found in consultation:', consultation);
        setPatientData({
          survey: null,
          prakriti: null,
          personal: {
            _id: 'unknown',
            name: consultation?.patientName || 'Unknown Patient',
            email: consultation?.patientEmail || 'N/A',
            phone: consultation?.patientPhone || 'N/A'
          }
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔄 Fetching patient data for ID:', patientId);
        
        const basicPatientData = {
          survey: null,
          prakriti: null,
          personal: {
            _id: patientId,
            name: consultation.patientName || consultation.patient?.name || 'Unknown',
            email: consultation.patientEmail || consultation.patient?.email || 'N/A',
            phone: consultation.patientPhone || consultation.patient?.phone || 'N/A'
          }
        };
        setPatientData(basicPatientData);
        
        // Fetch survey data with individual error handling
        let surveyData = null;
        try {
          console.log('🔄 Fetching survey data for patient:', patientId);
          const surveyResponse = await ApiService.getPatientSurveyData(patientId);
          surveyData = surveyResponse.data || surveyResponse;
          console.log('✅ Survey data loaded:', surveyData);
        } catch (surveyError) {
          console.error('❌ Error fetching survey data:', surveyError);
          surveyData = null;
        }

        // Fetch prakriti data with individual error handling
        let prakritiData = null;
        try {
          console.log('🔄 Fetching prakriti data for patient:', patientId);
          const prakritiResponse = await ApiService.getPatientPrakritiData(patientId);
          prakritiData = prakritiResponse.data || prakritiResponse;
          console.log('✅ Prakriti data loaded:', prakritiData);
        } catch (prakritiError) {
          console.error('❌ Error fetching prakriti data:', prakritiError);
          prakritiData = null;
        }
        
        // Update patient data with whatever we could fetch
        setPatientData({
          survey: surveyData,
          prakriti: prakritiData,
          personal: basicPatientData.personal
        });
        
        console.log('✅ Patient data loading completed with available data');
      } catch (error) {
        console.error('❌ Error in fetchPatientData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [consultation]);

  const handleGeneratePlan = async () => {
    try {
      setIsGeneratingPlan(true);
      
      const patientId = consultation?.patientId || consultation?.patient?._id || consultation?.patient;
      
      const planData = {
        patientId: patientId,
        consultationId: consultation.id || consultation._id,
        notes: consultationNotes,
        symptoms,
        diagnosis,
        recommendations,
        patientData
      };
      
      if (onGeneratePlan) {
        await onGeneratePlan(planData);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSaveAndClose = async () => {
    try {
      if (consultationNotes || symptoms || diagnosis || recommendations) {
        const updateData = {
          notes: consultationNotes,
          symptoms,
          diagnosis,
          recommendations,
          status: 'completed'
        };
        
        await ApiService.updateAppointmentNotes(consultation.id || consultation._id, updateData);
        console.log('Consultation data saved successfully');
      }
      
      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Failed to save consultation data. Please try again.');
    }
  };

  // Helper functions for templates
  const addTemplate = (field, template) => {
    if (field === 'symptoms') {
      setSymptoms(prev => prev ? `${prev}, ${template}` : template);
    } else if (field === 'diagnosis') {
      setDiagnosis(prev => prev ? `${prev}, ${template}` : template);
    } else if (field === 'recommendations') {
      setRecommendations(prev => prev ? `${prev}, ${template}` : template);
    }
  };

  const toggleQuickAction = (action) => {
    setQuickActions(prev => ({
      ...prev,
      [action]: !prev[action]
    }));
  };

  // Modern styles
  const modernStyles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#F8FAFC',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    header: {
      background: 'linear-gradient(135deg, #2C5F41 0%, #3E8E5A 100%)',
      color: 'white',
      padding: '1.5rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 20px rgba(44, 95, 65, 0.3)',
      position: 'relative'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    timer: {
      background: 'rgba(255,255,255,0.2)',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.3)',
      fontWeight: '600',
      fontSize: '1.1rem'
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '2rem',
      backgroundColor: '#F8FAFC'
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr 280px',
      gap: '2rem',
      maxWidth: '1600px',
      margin: '0 auto',
      height: '100%'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    mainArea: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    quickPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      border: '1px solid #E5E7EB'
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    tabContainer: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #E5E7EB',
      paddingBottom: '1rem'
    },
    tab: (active) => ({
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: active ? '#3E8E5A' : '#F3F4F6',
      color: active ? 'white' : '#6B7280',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    }),
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      fontFamily: 'inherit'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      fontFamily: 'inherit',
      minHeight: '120px',
      resize: 'vertical'
    },
    button: {
      backgroundColor: '#3E8E5A',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    buttonSecondary: {
      backgroundColor: '#6B7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.5rem',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    templateTag: {
      background: '#F0FDF4',
      color: '#166534',
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      border: '1px solid #BBF7D0',
      transition: 'all 0.2s ease',
      marginBottom: '0.5rem',
      display: 'inline-block',
      marginRight: '0.5rem'
    },
    quickAction: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: active ? '#F0FDF4' : '#F9FAFB',
      border: `1px solid ${active ? '#BBF7D0' : '#E5E7EB'}`,
      color: active ? '#166534' : '#6B7280'
    }),
    badge: {
      background: '#FEF3C7',
      color: '#92400E',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600'
    }
  };

  if (isLoading) {
    return (
      <div style={modernStyles.container}>
        <div style={modernStyles.header}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Loading Consultation Data...</h2>
          <button 
            onClick={onClose}
            style={modernStyles.buttonSecondary}
          >
            Close
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          fontSize: '16px',
          color: '#687076'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔄</div>
            <h3>Loading patient information...</h3>
            <p>Please wait while we fetch the consultation data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div style={modernStyles.container}>
        <div style={modernStyles.header}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Error</h2>
          <button 
            onClick={onClose}
            style={modernStyles.buttonSecondary}
          >
            Close
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          fontSize: '16px',
          color: '#DC2626',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3>No Consultation Data Available</h3>
          <p>Unable to load consultation. Please try again.</p>
        </div>
      </div>
    );
  }

  const patientId = consultation?.patientId || consultation?.patient?._id || consultation?.patient;

  if (!patientId) {
    return (
      <div style={modernStyles.container}>
        <div style={modernStyles.header}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Consultation - {consultation?.patientName || 'Patient'}</h2>
          <button 
            onClick={onClose}
            style={modernStyles.buttonSecondary}
          >
            Close
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          fontSize: '16px',
          color: '#DC2626',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3>No Patient Information Available</h3>
          <p>Unable to identify patient for this consultation.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={modernStyles.container}>
      {/* Modern Header with Timer */}
      <div style={modernStyles.header}>
        <div style={modernStyles.headerLeft}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
              🩺 Consultation - {consultation?.patientName || 'Patient'}
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '14px' }}>
              {new Date(consultation?.date).toLocaleDateString()} • {consultation?.time} • Session #{consultation?.id?.slice(-4) || 'N/A'}
            </p>
          </div>
        </div>
        <div style={modernStyles.headerRight}>
          <div style={modernStyles.timer}>
            ⏱️ {formatTime(consultationTimer)}
          </div>
          <button 
            onClick={() => setTimerActive(!timerActive)}
            style={{
              ...modernStyles.buttonSecondary,
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {timerActive ? '⏸️' : '▶️'}
          </button>
          <button 
            onClick={handleSaveAndClose}
            style={{
              ...modernStyles.button,
              backgroundColor: '#F59E0B'
            }}
          >
            💾 Save & Close
          </button>
          <button 
            onClick={onClose}
            style={modernStyles.buttonSecondary}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Modern Three-Column Layout */}
      <div style={modernStyles.content}>
        <div style={modernStyles.layout}>
          
          {/* Left Sidebar - Patient Info & Vitals */}
          <div style={modernStyles.sidebar}>
            {/* Patient Overview */}
            <div style={modernStyles.card}>
              <h3 style={modernStyles.cardTitle}>
                👤 Patient Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <strong>Name:</strong> {patientData.personal?.name || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {patientData.personal?.email || 'N/A'}
                </div>
                <div>
                  <strong>Phone:</strong> {patientData.personal?.phone || 'N/A'}
                </div>
                
                {/* Survey Data Section */}
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    📋 Survey Information
                  </div>
                  {patientData.survey?.surveyData ? (
                    <>
                      <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
                        <strong>Age:</strong> {patientData.survey.surveyData.age || 'N/A'}
                      </div>
                      {patientData.survey.surveyData.weight && (
                        <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
                          <strong>Weight:</strong> {patientData.survey.surveyData.weight} kg
                        </div>
                      )}
                      {patientData.survey.surveyData.height && (
                        <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
                          <strong>Height:</strong> {patientData.survey.surveyData.height} cm
                        </div>
                      )}
                      {patientData.survey.surveyData.bmi && (
                        <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
                          <strong>BMI:</strong> {patientData.survey.surveyData.bmi}
                        </div>
                      )}
                      {patientData.survey.surveyData.lifestyle && (
                        <div style={{ fontSize: '13px', marginBottom: '0.25rem' }}>
                          <strong>Lifestyle:</strong> {patientData.survey.surveyData.lifestyle}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                      {isLoading ? 'Loading survey data...' : 'No survey data available'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            <div style={modernStyles.card}>
              <h3 style={modernStyles.cardTitle}>
                🫀 Vital Signs
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.25rem' }}>
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    placeholder="120/80 mmHg"
                    value={vitalSigns.bloodPressure}
                    onChange={(e) => setVitalSigns(prev => ({ ...prev, bloodPressure: e.target.value }))}
                    style={modernStyles.input}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.25rem' }}>
                    Heart Rate
                  </label>
                  <input
                    type="text"
                    placeholder="72 bpm"
                    value={vitalSigns.heartRate}
                    onChange={(e) => setVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
                    style={modernStyles.input}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.25rem' }}>
                    Temperature
                  </label>
                  <input
                    type="text"
                    placeholder="98.6°F"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                    style={modernStyles.input}
                  />
                </div>
              </div>
            </div>

            {/* Prakriti Assessment */}
            <div style={modernStyles.card}>
              <h3 style={modernStyles.cardTitle}>
                🧘 Prakriti Assessment
              </h3>
              {patientData.prakriti?.prakritiCompleted ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <strong>Primary Dosha:</strong>
                    <span style={modernStyles.badge}>
                      {patientData.prakriti.assessmentData?.dominantDosha || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <strong>Constitution:</strong> {patientData.prakriti.assessmentData?.prakritiType || 'N/A'}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>Dosha Scores:</div>
                    <div style={{ marginTop: '0.25rem', fontSize: '12px' }}>
                      <div>Vata: {patientData.prakriti.assessmentData?.scores?.vata || 0}%</div>
                      <div>Pitta: {patientData.prakriti.assessmentData?.scores?.pitta || 0}%</div>
                      <div>Kapha: {patientData.prakriti.assessmentData?.scores?.kapha || 0}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: '8px',
                  border: '1px solid #F59E0B'
                }}>
                  <div style={{ fontSize: '13px', color: '#92400E', fontWeight: '600', marginBottom: '0.5rem' }}>
                    ⚠️ Prakriti Assessment Missing
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400E' }}>
                    {isLoading ? 'Loading prakriti data...' : 'Patient has not completed their Prakriti assessment yet. Consider asking them to complete it for better treatment planning.'}
                  </div>
                  {!isLoading && (
                    <button
                      onClick={() => {
                        // You can add functionality to send assessment link to patient
                        alert('Assessment link functionality can be implemented here');
                      }}
                      style={{
                        ...modernStyles.button,
                        marginTop: '0.5rem',
                        fontSize: '11px',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#F59E0B'
                      }}
                    >
                      Send Assessment Link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div style={modernStyles.mainArea}>
            
            {/* Tab Navigation */}
            <div style={modernStyles.tabContainer}>
              <button 
                onClick={() => setActiveTab('overview')}
                style={modernStyles.tab(activeTab === 'overview')}
              >
                📋 Overview
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                style={modernStyles.tab(activeTab === 'notes')}
              >
                📝 Notes
              </button>
              <button 
                onClick={() => setActiveTab('assessment')}
                style={modernStyles.tab(activeTab === 'assessment')}
              >
                🔍 Assessment
              </button>
              <button 
                onClick={() => setActiveTab('plan')}
                style={modernStyles.tab(activeTab === 'plan')}
              >
                💊 Treatment Plan
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div style={modernStyles.card}>
                <h3 style={modernStyles.cardTitle}>📊 Patient Overview</h3>
                
                {/* Survey Data Status */}
                <div style={{ 
                  marginBottom: '1.5rem', 
                  padding: '1rem', 
                  backgroundColor: patientData.survey ? '#F0FDF4' : '#FEF3C7',
                  borderRadius: '8px',
                  border: `1px solid ${patientData.survey ? '#22C55E' : '#F59E0B'}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem' }}>
                    📋 Survey Data Status
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151' }}>
                    {isLoading ? (
                      'Loading survey data...'
                    ) : patientData.survey ? (
                      `✅ Survey completed. Patient data available.`
                    ) : (
                      '⚠️ No survey data found. Patient may not have completed their health survey.'
                    )}
                  </div>
                  {/* Debug info (remove in production) */}
                  {!isLoading && (
                    <details style={{ marginTop: '0.5rem', fontSize: '11px', color: '#6B7280' }}>
                      <summary style={{ cursor: 'pointer' }}>Debug Info</summary>
                      <pre style={{ marginTop: '0.5rem', fontSize: '10px' }}>
                        {JSON.stringify({
                          surveyExists: !!patientData.survey,
                          surveyDataExists: !!patientData.survey?.surveyData,
                          patientId: consultation?.patientId || consultation?.patient?._id || consultation?.patient,
                          consultatationData: {
                            patientId: consultation?.patientId,
                            patientName: consultation?.patientName,
                            patientEmail: consultation?.patientEmail
                          }
                        }, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h4 style={{ color: '#2C5F41', marginBottom: '0.75rem' }}>Health Conditions</h4>
                    {patientData.survey?.surveyData?.healthConditions && patientData.survey.surveyData.healthConditions.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        {patientData.survey.surveyData.healthConditions.map((condition, index) => (
                          <li key={index} style={{ marginBottom: '0.25rem' }}>{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic', margin: 0 }}>
                        {isLoading ? 'Loading...' : 'No health conditions reported'}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 style={{ color: '#2C5F41', marginBottom: '0.75rem' }}>Allergies</h4>
                    {patientData.survey?.surveyData?.allergies && patientData.survey.surveyData.allergies.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        {patientData.survey.surveyData.allergies.map((allergy, index) => (
                          <li key={index} style={{ marginBottom: '0.25rem' }}>{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#6B7280', fontStyle: 'italic', margin: 0 }}>
                        {isLoading ? 'Loading...' : 'No allergies reported'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Survey Information */}
                {patientData.survey?.surveyData && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ color: '#2C5F41', marginBottom: '0.75rem' }}>Additional Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '14px' }}>
                      {patientData.survey.surveyData.lifestyle && (
                        <div>
                          <strong>Lifestyle:</strong> {patientData.survey.surveyData.lifestyle}
                        </div>
                      )}
                      {patientData.survey.surveyData.weight && (
                        <div>
                          <strong>Weight:</strong> {patientData.survey.surveyData.weight} kg
                        </div>
                      )}
                      {patientData.survey.surveyData.height && (
                        <div>
                          <strong>Height:</strong> {patientData.survey.surveyData.height} cm
                        </div>
                      )}
                      {patientData.survey.surveyData.bmi && (
                        <div>
                          <strong>BMI:</strong> {patientData.survey.surveyData.bmi}
                        </div>
                      )}
                      {patientData.survey.surveyData.preferredCuisine && patientData.survey.surveyData.preferredCuisine.length > 0 && (
                        <div>
                          <strong>Preferred Cuisine:</strong> {patientData.survey.surveyData.preferredCuisine.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div style={modernStyles.card}>
                <h3 style={modernStyles.cardTitle}>📝 Consultation Notes</h3>
                <textarea
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Enter detailed consultation notes..."
                  style={modernStyles.textarea}
                />
              </div>
            )}

            {activeTab === 'assessment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={modernStyles.card}>
                  <h3 style={modernStyles.cardTitle}>🩺 Symptoms</h3>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Document patient symptoms and observations..."
                    style={modernStyles.textarea}
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                      Quick Templates:
                    </div>
                    {consultationTemplates.symptoms.map((template, index) => (
                      <span
                        key={index}
                        onClick={() => addTemplate('symptoms', template)}
                        style={modernStyles.templateTag}
                      >
                        {template}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={modernStyles.card}>
                  <h3 style={modernStyles.cardTitle}>🔬 Diagnosis</h3>
                  <textarea
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Enter your diagnostic assessment..."
                    style={modernStyles.textarea}
                  />
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                      Common Diagnoses:
                    </div>
                    {consultationTemplates.diagnoses.map((template, index) => (
                      <span
                        key={index}
                        onClick={() => addTemplate('diagnosis', template)}
                        style={modernStyles.templateTag}
                      >
                        {template}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <div style={modernStyles.card}>
                <h3 style={modernStyles.cardTitle}>💊 Treatment Recommendations</h3>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Enter treatment plan and recommendations..."
                  style={modernStyles.textarea}
                />
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                    Common Recommendations:
                  </div>
                  {consultationTemplates.recommendations.map((template, index) => (
                    <span
                      key={index}
                      onClick={() => addTemplate('recommendations', template)}
                      style={modernStyles.templateTag}
                    >
                      {template}
                    </span>
                  ))}
                </div>
                
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan}
                    style={{
                      ...modernStyles.button,
                      backgroundColor: isGeneratingPlan ? '#9CA3AF' : '#3E8E5A'
                    }}
                  >
                    Create meal plan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Quick Actions & Templates */}
          <div style={modernStyles.quickPanel}>
            
            {/* Quick Actions */}
            <div style={modernStyles.card}>
              <h3 style={modernStyles.cardTitle}>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div 
                  onClick={() => toggleQuickAction('prescriptionSent')}
                  style={modernStyles.quickAction(quickActions.prescriptionSent)}
                >
                  <span style={{ fontSize: '20px' }}>💊</span>
                  <span style={{ fontSize: '12px' }}>Prescription Sent</span>
                  {quickActions.prescriptionSent && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </div>
                
                <div 
                  onClick={() => toggleQuickAction('followUpScheduled')}
                  style={modernStyles.quickAction(quickActions.followUpScheduled)}
                >
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <span style={{ fontSize: '12px' }}>Follow-up Scheduled</span>
                  {quickActions.followUpScheduled && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </div>
                
                <div 
                  onClick={() => toggleQuickAction('labOrderSent')}
                  style={modernStyles.quickAction(quickActions.labOrderSent)}
                >
                  <span style={{ fontSize: '20px' }}>🧪</span>
                  <span style={{ fontSize: '12px' }}>Lab Order Sent</span>
                  {quickActions.labOrderSent && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </div>
                
                <div 
                  onClick={() => toggleQuickAction('referralMade')}
                  style={modernStyles.quickAction(quickActions.referralMade)}
                >
                  <span style={{ fontSize: '20px' }}>🏥</span>
                  <span style={{ fontSize: '12px' }}>Referral Made</span>
                  {quickActions.referralMade && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </div>
              </div>
            </div>

            {/* Patient History Summary */}
            <div style={modernStyles.card}>
              <h3 style={modernStyles.cardTitle}>📈 Session Summary</h3>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Session Duration:</strong> {formatTime(consultationTimer)}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Notes Entered:</strong> {consultationNotes.length > 0 ? '✓' : '—'}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Symptoms Documented:</strong> {symptoms.length > 0 ? '✓' : '—'}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Diagnosis Made:</strong> {diagnosis.length > 0 ? '✓' : '—'}
                </div>
                <div>
                  <strong>Treatment Plan:</strong> {recommendations.length > 0 ? '✓' : '—'}
                </div>
              </div>
            </div>

            {/* BMI & Physical Stats */}
            {patientData.survey?.surveyData && (
              <div style={modernStyles.card}>
                <h3 style={modernStyles.cardTitle}>📏 Physical Stats</h3>
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <strong>Height:</strong> {patientData.survey.surveyData.height || 'N/A'} cm
                  </div>
                  <div>
                    <strong>Weight:</strong> {patientData.survey.surveyData.weight || 'N/A'} kg
                  </div>
                  <div>
                    <strong>BMI:</strong> {
                      patientData.survey.surveyData.bmi && typeof patientData.survey.surveyData.bmi === 'number' 
                        ? patientData.survey.surveyData.bmi.toFixed(1) 
                        : (patientData.survey.surveyData.bmi || 'N/A')
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;