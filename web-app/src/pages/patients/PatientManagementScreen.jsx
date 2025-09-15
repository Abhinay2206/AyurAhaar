import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components';
import { formatDate, getBMICategory, getPrakritiColor } from '../../utils';
import ApiService from '../../services/api';

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

const AddPatientModal = ({ onClose, onPatientAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    weight_kg: '',
    height_cm: '',
    lifestyle: 'sedentary',
    prakriti: 'Vata',
    health_conditions: '',
    allergies: '',
    preferred_cuisine: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // This would be the actual API call to create a patient
      console.log('Creating patient:', formData);
      // await ApiService.createPatient(formData);
      onPatientAdded();
    } catch (error) {
      setError('Failed to create patient. Please try again.', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Add New Patient" size="large">
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
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

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
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

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
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

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
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

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Prakriti
            </label>
            <select
              value={formData.prakriti}
              onChange={(e) => handleChange('prakriti', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <option value="Vata">Vata</option>
              <option value="Pitta">Pitta</option>
              <option value="Kapha">Kapha</option>
              <option value="Mixed">Mixed</option>
            </select>
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
            {loading ? 'Creating...' : 'Create Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const PlanModal = ({ patient, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`Treatment Plan - ${patient.name}`} size="large">
      <div style={{ textAlign: 'center', padding: '40px', color: '#687076' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ color: '#2C5F41', marginBottom: '8px' }}>Treatment Plan</h3>
        <p>Treatment plan details for {patient.name} will be displayed here.</p>
        <p style={{ fontSize: '14px', marginTop: '16px' }}>
          This feature will show the patient's current treatment plan, dietary recommendations, 
          and progress tracking.
        </p>
      </div>
    </Modal>
  );
};

const AppointmentModal = ({ patient, onClose, onAppointmentScheduled }) => {
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Scheduling appointment:', appointmentData);
    onAppointmentScheduled();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Schedule Appointment - ${patient.name}`} size="medium">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Appointment Date
            </label>
            <input
              type="date"
              required
              value={appointmentData.date}
              onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
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
              Appointment Time
            </label>
            <input
              type="time"
              required
              value={appointmentData.time}
              onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
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
              Appointment Type
            </label>
            <select
              value={appointmentData.type}
              onChange={(e) => setAppointmentData(prev => ({ ...prev, type: e.target.value }))}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#2C5F41' }}>
              Notes
            </label>
            <textarea
              value={appointmentData.notes}
              onChange={(e) => setAppointmentData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                resize: 'vertical'
              }}
              placeholder="Additional notes for the appointment..."
            />
          </div>
        </div>

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
            style={{
              padding: '8px 16px',
              backgroundColor: '#3E8E5A',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Schedule Appointment
          </button>
        </div>
      </form>
    </Modal>
  );
};

const HistoryModal = ({ patient, onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`Patient History - ${patient.name}`} size="large">
      <div style={{ textAlign: 'center', padding: '40px', color: '#687076' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{ color: '#2C5F41', marginBottom: '8px' }}>Patient History</h3>
        <p>Medical history and treatment records for {patient.name} will be displayed here.</p>
        <p style={{ fontSize: '14px', marginTop: '16px' }}>
          This feature will show appointment history, treatment progress, test results, 
          and other medical records.
        </p>
      </div>
    </Modal>
  );
};

const PatientManagementScreen = () => {
  // eslint-disable-next-line no-unused-vars
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    prakriti: 'all',
    healthCondition: 'all',
    ageGroup: 'all',
    lifestyle: 'all'
  });
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
    limit: 10
  });

  // Load patients from API
  const fetchPatients = async (page = 1, resetPagination = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCriteria.prakriti !== 'all') filters.prakriti = filterCriteria.prakriti;
      if (filterCriteria.healthCondition !== 'all') filters.healthCondition = filterCriteria.healthCondition;
      if (filterCriteria.ageGroup !== 'all') filters.ageGroup = filterCriteria.ageGroup;
      if (filterCriteria.lifestyle !== 'all') filters.lifestyle = filterCriteria.lifestyle;
      
      const response = await ApiService.getAllPatients({
        ...filters,
        page,
        limit: pagination.limit
      });
      
      // Extract data from the nested response structure
      const data = response.data || response;
      
      setPatients(data.patients || []);
      setFilteredPatients(data.patients || []);
      
      if (resetPagination) {
        setPagination({
          currentPage: 1,
          totalPages: data.pagination?.totalPages || 1,
          totalPatients: data.pagination?.total || 0,
          limit: data.pagination?.limit || 10
        });
      } else {
        setPagination(prev => ({
          ...prev,
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          totalPatients: data.pagination?.total || 0,
          limit: data.pagination?.limit || 10
        }));
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPatients(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When filters change, reset to page 1
  useEffect(() => {
    if (searchTerm || filterCriteria.prakriti !== 'all' || filterCriteria.healthCondition !== 'all' || 
        filterCriteria.ageGroup !== 'all' || filterCriteria.lifestyle !== 'all') {
      fetchPatients(1, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterCriteria]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    fetchPatients(newPage, false);
  };

  // Action handlers
  const handleViewPlan = (patient) => {
    setSelectedPatient(patient);
    setShowPlanModal(true);
  };

  const handleScheduleAppointment = (patient) => {
    setSelectedPatient(patient);
    setShowAppointmentModal(true);
  };

  const handleViewHistory = (patient) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  const handleAddPatient = () => {
    setShowAddPatientModal(true);
  };

  // Dashboard-themed styles
  const containerStyles = {
    padding: '1rem', // Slightly increased padding
    backgroundColor: '#F5F7FA',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyles = {
    marginBottom: '1rem', // Slightly increased margin
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyles = {
    fontSize: '1.5rem', // Increased from 1.25rem
    fontWeight: '700',
    color: '#2C5F41', // Section header color from theme
    margin: 0,
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#3E8E5A'; // Herbal green from theme
      case 'Completed': return '#687076'; // Icon color from theme
      case 'Inactive': return '#DC3545'; // Error color
      default: return '#687076'; // Icon color from theme
    }
  };

  const PatientModal = () => {
    if (!selectedPatient) return null;

    const modalOverlayStyles = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '10px'
    };

    const modalStyles = {
      backgroundColor: '#F5F7FA',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      maxWidth: '800px',
      maxHeight: '90vh',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    };

    const modalHeaderStyles = {
      padding: '16px 20px', // Increased padding
      backgroundColor: '#3E8E5A',
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e5e7eb'
    };

    const modalTitleStyles = {
      margin: 0,
      fontSize: '18px', // Increased from 16px
      fontWeight: '600',
      color: 'white',
      fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    };

    const closeButtonStyles = {
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '24px', // Increased from 20px
      cursor: 'pointer',
      padding: '4px 8px', // Increased padding
      borderRadius: '4px'
    };

    const modalContentStyles = {
      padding: '16px', // Increased from 12px
      overflowY: 'auto',
      flex: 1
    };

    return (
      <div style={modalOverlayStyles} onClick={() => setShowPatientModal(false)}>
        <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
          <div style={modalHeaderStyles}>
            <h2 style={modalTitleStyles}>{selectedPatient.name}</h2>
            <button 
              style={closeButtonStyles}
              onClick={() => setShowPatientModal(false)}
            >
              ×
            </button>
          </div>
          
          <div style={modalContentStyles}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px', // Increased from 12px
              marginBottom: '16px' // Increased from 12px
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '16px', // Increased from 12px
                borderRadius: '8px', // Increased from 6px
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '16px', // Increased from 14px
                  fontWeight: '600',
                  color: '#2C5F41',
                  margin: '0 0 12px 0', // Increased margin
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '6px', // Increased padding
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>Basic Information</h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0', // Increased from 4px
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '14px' // Increased from 12px
                }}>
                  <span style={{color: '#687076', fontWeight: '500', fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>Patient ID:</span>
                  <span style={{color: '#374151', fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>{selectedPatient.patient_id}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Age:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.age} years</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Gender:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.gender === 'M' ? 'Male' : 'Female'}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Phone:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.phone}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Email:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.email}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Address:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.address}</span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C5F41',
                  margin: '0 0 8px 0',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}>Health Profile</h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Height:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.height_cm} cm</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Weight:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.weight_kg} kg</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>BMI:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.BMI} ({getBMICategory(selectedPatient.BMI)})</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Prakriti:</span>
                  <span style={{color: getPrakritiColor(selectedPatient.prakriti)}}>
                    {selectedPatient.prakriti}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Lifestyle:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.lifestyle}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Health Conditions:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.health_conditions}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Allergies:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.allergies}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Preferred Cuisine:</span>
                  <span style={{color: '#374151'}}>{selectedPatient.preferred_cuisine}</span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C5F41',
                  margin: '0 0 8px 0',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '4px'
                }}>Treatment Information</h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Status:</span>
                  <span style={{color: getStatusColor(selectedPatient.treatment_status)}}>
                    {selectedPatient.treatment_status}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Joining Date:</span>
                  <span style={{color: '#374151'}}>{formatDate(selectedPatient.joining_date)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Last Visit:</span>
                  <span style={{color: '#374151'}}>{formatDate(selectedPatient.last_visit)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  fontSize: '12px'
                }}>
                  <span style={{color: '#687076', fontWeight: '500'}}>Next Appointment:</span>
                  <span style={{color: '#374151'}}>
                    {selectedPatient.next_appointment 
                      ? formatDate(selectedPatient.next_appointment)
                      : 'Not scheduled'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              padding: '12px 0 0 0',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button variant="primary">View Diet Plan</Button>
              <Button variant="secondary">Schedule Appointment</Button>
              <Button variant="outline">Edit Patient</Button>
              <Button variant="outline">Medical History</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '12px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3E8E5A',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{color: '#687076', fontSize: '14px'}}>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>Patient Management</h1>
          <p style={{color: '#687076', fontSize: '14px', margin: '4px 0 0 0', fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}}>Manage and monitor your patients' health journey</p>
        </div>
        <div>
          <button 
            onClick={handleAddPatient}
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
            Add New Patient
          </button>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        marginBottom: '12px'
      }}>
        <div style={{marginBottom: '12px'}}>
          <Input
            type="text"
            placeholder="Search patients by name, ID, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="⌕"
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <select
            value={filterCriteria.prakriti}
            onChange={(e) => setFilterCriteria({...filterCriteria, prakriti: e.target.value})}
            style={{
              padding: '8px 10px', // Increased padding
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '14px', // Increased from 12px
              backgroundColor: 'white',
              color: '#374151',
              outline: 'none',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            <option value="all">All Prakriti</option>
            <option value="Vata">Vata</option>
            <option value="Pitta">Pitta</option>
            <option value="Kapha">Kapha</option>
            <option value="Mixed">Mixed</option>
          </select>

          <select
            value={filterCriteria.healthCondition}
            onChange={(e) => setFilterCriteria({...filterCriteria, healthCondition: e.target.value})}
            style={{
              padding: '8px 10px', // Increased padding
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '14px', // Increased from 12px
              backgroundColor: 'white',
              color: '#374151',
              outline: 'none',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            <option value="all">All Conditions</option>
            <option value="none">No Conditions</option>
            <option value="diabetes">Diabetes</option>
            <option value="hypertension">Hypertension</option>
            <option value="obesity">Obesity</option>
            <option value="kidney">Kidney Issues</option>
          </select>

          <select
            value={filterCriteria.ageGroup}
            onChange={(e) => setFilterCriteria({...filterCriteria, ageGroup: e.target.value})}
            style={{
              padding: '8px 10px', // Increased padding
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '14px', // Increased from 12px
              backgroundColor: 'white',
              color: '#374151',
              outline: 'none',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            <option value="all">All Ages</option>
            <option value="young">Under 30</option>
            <option value="middle">30-50</option>
            <option value="senior">Over 50</option>
          </select>

          <select
            value={filterCriteria.lifestyle}
            onChange={(e) => setFilterCriteria({...filterCriteria, lifestyle: e.target.value})}
            style={{
              padding: '8px 10px', // Increased padding
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '14px', // Increased from 12px
              backgroundColor: 'white',
              color: '#374151',
              outline: 'none',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
          >
            <option value="all">All Lifestyles</option>
            <option value="sedentary">Sedentary</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '12px'
      }}>
        {filteredPatients.map(patient => (
          <Card 
            key={patient.patient_id} 
            style={{
              padding: '16px', // Increased padding
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e5e7eb',
              ':hover': {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: '#3E8E5A'
              }
            }}
            onClick={() => handlePatientSelect(patient)}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div>
                <h3 style={{
                  margin: '0 0 4px 0', // Increased margin
                  fontSize: '16px', // Increased from 14px
                  fontWeight: '600',
                  color: '#2C5F41',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>{patient.name}</h3>
                <p style={{
                  margin: 0,
                  fontSize: '13px', // Increased from 11px
                  color: '#687076',
                  fontFamily: 'monospace'
                }}>{patient.patient_id}</p>
              </div>
              <div style={{
                backgroundColor: getStatusColor(patient.treatment_status),
                color: 'white',
                padding: '4px 8px', // Increased padding
                borderRadius: '4px',
                fontSize: '12px', // Increased from 10px
                fontWeight: '500',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {patient.treatment_status}
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px' // Increased gap
            }}>
              <div style={{
                fontSize: '13px', // Increased from 11px
                color: '#687076',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                <span>Age: {patient.age} | {patient.gender === 'M' ? 'Male' : 'Female'}</span>
              </div>
              <div style={{
                fontSize: '13px', // Increased from 11px
                color: '#687076',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                <span>BMI: {patient.BMI} ({getBMICategory(patient.BMI)})</span>
              </div>
              <div style={{
                fontSize: '13px', // Increased from 11px
                color: '#687076',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px', // Increased margin
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                <span style={{color: getPrakritiColor(patient.prakriti), fontWeight: '500'}}>
                  Prakriti: {patient.prakriti}
                </span>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#687076',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2px'
              }}>
                <span>Conditions: {patient.health_conditions}</span>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#687076',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2px'
              }}>
                <span>Last Visit: {formatDate(patient.last_visit)}</span>
              </div>
              {patient.next_appointment && (
                <div style={{
                  fontSize: '11px',
                  color: '#3E8E5A',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: '500'
                }}>
                  <span>Next: {formatDate(patient.next_appointment)}</span>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '4px',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #f3f4f6'
            }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPlan(patient);
                }}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '10px',
                  backgroundColor: '#3E8E5A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                View Plan
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleScheduleAppointment(patient);
                }}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '10px',
                  backgroundColor: '#F4A261',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Appointment
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewHistory(patient);
                }}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '10px',
                  backgroundColor: '#687076',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                History
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          fontSize: '16px',
          color: '#687076'
        }}>
          Loading patients...
        </div>
      )}

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
            onClick={fetchPatients}
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

      {/* No Results */}
      {!loading && !error && filteredPatients.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#687076'
        }}>
          <div style={{fontSize: '48px', marginBottom: '12px'}}>⚕</div>
          <h3 style={{color: '#2C5F41', margin: '0 0 6px 0', fontSize: '16px'}}>No patients found</h3>
          <p style={{margin: '0 0 16px 0', fontSize: '12px'}}>Try adjusting your search criteria or add a new patient.</p>
          <button 
            onClick={handleAddPatient}
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
            Add New Patient
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          marginTop: '24px',
          padding: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            style={{
              padding: '8px 16px',
              backgroundColor: pagination.currentPage === 1 ? '#f3f4f6' : '#3E8E5A',
              color: pagination.currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pagination.currentPage === 1 ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Previous
          </button>
          
          <div style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center'
          }}>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: pagination.currentPage === pageNum ? '#3E8E5A' : 'transparent',
                    color: pagination.currentPage === pageNum ? 'white' : '#2C5F41',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: pagination.currentPage === pageNum ? '600' : '400'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            style={{
              padding: '8px 16px',
              backgroundColor: pagination.currentPage === pagination.totalPages ? '#f3f4f6' : '#3E8E5A',
              color: pagination.currentPage === pagination.totalPages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: pagination.currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Next
          </button>
          
          <div style={{
            marginLeft: '12px',
            fontSize: '14px',
            color: '#687076',
            fontFamily: "'Inter', sans-serif"
          }}>
            Page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalPatients} patients total)
          </div>
        </div>
      )}

      {/* Modals */}
      {showPatientModal && <PatientModal />}
      
      {showAddPatientModal && (
        <AddPatientModal 
          onClose={() => setShowAddPatientModal(false)}
          onPatientAdded={() => {
            setShowAddPatientModal(false);
            fetchPatients(1, true); // Refresh patients list
          }}
        />
      )}

      {showPlanModal && selectedPatient && (
        <PlanModal 
          patient={selectedPatient}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedPatient(null);
          }}
        />
      )}

      {showAppointmentModal && selectedPatient && (
        <AppointmentModal 
          patient={selectedPatient}
          onClose={() => {
            setShowAppointmentModal(false);
            setSelectedPatient(null);
          }}
          onAppointmentScheduled={() => {
            setShowAppointmentModal(false);
            setSelectedPatient(null);
            fetchPatients(pagination.currentPage, false); // Refresh current page
          }}
        />
      )}

      {showHistoryModal && selectedPatient && (
        <HistoryModal 
          patient={selectedPatient}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default PatientManagementScreen;
