import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from '../../components';
import { formatDate, getBMICategory, getPrakritiColor } from '../../utils';
import { ApiService } from '../../services';

// Mock patient data based on the CSV structure
const mockPatients = [
  {
    patient_id: 'P0001',
    name: 'Rajesh Kumar',
    age: 56,
    gender: 'M',
    weight_kg: 76.2,
    height_cm: 171,
    BMI: 26.1,
    lifestyle: 'sedentary',
    prakriti: 'Kapha',
    health_conditions: 'None',
    allergies: 'None',
    preferred_cuisine: 'Chinese',
    phone: '+91 9876543210',
    email: 'rajesh.kumar@email.com',
    address: 'Banjara Hills, Hyderabad',
    last_visit: '2024-01-15',
    next_appointment: '2024-02-10',
    treatment_status: 'Active',
    joining_date: '2023-06-15'
  },
  {
    patient_id: 'P0002',
    name: 'Priya Sharma',
    age: 36,
    gender: 'F',
    weight_kg: 61.4,
    height_cm: 174,
    BMI: 20.3,
    lifestyle: 'sedentary',
    prakriti: 'Vata',
    health_conditions: 'Obesity',
    allergies: 'peanuts',
    preferred_cuisine: 'North Indian',
    phone: '+91 9876543211',
    email: 'priya.sharma@email.com',
    address: 'Jubilee Hills, Hyderabad',
    last_visit: '2024-01-18',
    next_appointment: '2024-02-15',
    treatment_status: 'Active',
    joining_date: '2023-08-22'
  },
  {
    patient_id: 'P0003',
    name: 'Anita Reddy',
    age: 20,
    gender: 'F',
    weight_kg: 66.2,
    height_cm: 159,
    BMI: 26.2,
    lifestyle: 'sedentary',
    prakriti: 'Vata',
    health_conditions: 'Hypertension',
    allergies: 'peanuts',
    preferred_cuisine: 'North Indian',
    phone: '+91 9876543212',
    email: 'anita.reddy@email.com',
    address: 'Gachibowli, Hyderabad',
    last_visit: '2024-01-20',
    next_appointment: '2024-02-08',
    treatment_status: 'Active',
    joining_date: '2023-09-10'
  },
  {
    patient_id: 'P0004',
    name: 'Vikram Singh',
    age: 29,
    gender: 'M',
    weight_kg: 68.3,
    height_cm: 175,
    BMI: 22.3,
    lifestyle: 'sedentary',
    prakriti: 'Vata',
    health_conditions: 'Obesity',
    allergies: 'milk',
    preferred_cuisine: 'Chinese',
    phone: '+91 9876543213',
    email: 'vikram.singh@email.com',
    address: 'Kondapur, Hyderabad',
    last_visit: '2024-01-12',
    next_appointment: '2024-02-20',
    treatment_status: 'Active',
    joining_date: '2023-07-05'
  },
  {
    patient_id: 'P0005',
    name: 'Sunita Devi',
    age: 33,
    gender: 'F',
    weight_kg: 59.8,
    height_cm: 160,
    BMI: 23.4,
    lifestyle: 'sedentary',
    prakriti: 'Mixed',
    health_conditions: 'None',
    allergies: 'None',
    preferred_cuisine: 'Italian',
    phone: '+91 9876543214',
    email: 'sunita.devi@email.com',
    address: 'Hitech City, Hyderabad',
    last_visit: '2024-01-22',
    next_appointment: null,
    treatment_status: 'Completed',
    joining_date: '2023-05-18'
  }
];

const PatientManagementScreen = () => {
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
  const [loading, setLoading] = useState(true);

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

  const filterPatients = useCallback(() => {
    let filtered = patients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Prakriti filter
    if (filterCriteria.prakriti !== 'all') {
      filtered = filtered.filter(patient => patient.prakriti === filterCriteria.prakriti);
    }

    // Health condition filter
    if (filterCriteria.healthCondition !== 'all') {
      filtered = filtered.filter(patient => 
        patient.health_conditions.toLowerCase().includes(filterCriteria.healthCondition.toLowerCase())
      );
    }

    // Age group filter
    if (filterCriteria.ageGroup !== 'all') {
      filtered = filtered.filter(patient => {
        const age = patient.age;
        switch (filterCriteria.ageGroup) {
          case 'young': return age < 30;
          case 'middle': return age >= 30 && age < 50;
          case 'senior': return age >= 50;
          default: return true;
        }
      });
    }

    // Lifestyle filter
    if (filterCriteria.lifestyle !== 'all') {
      filtered = filtered.filter(patient => patient.lifestyle === filterCriteria.lifestyle);
    }

    setFilteredPatients(filtered);
  }, [patients, searchTerm, filterCriteria]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

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
          <Button variant="primary">Add New Patient</Button>
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
              <button style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '10px',
                backgroundColor: '#3E8E5A',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}>View Plan</button>
              <button style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '10px',
                backgroundColor: '#F4A261',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}>Appointment</button>
              <button style={{
                flex: 1,
                padding: '4px 6px',
                fontSize: '10px',
                backgroundColor: '#687076',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}>History</button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#687076'
        }}>
          <div style={{fontSize: '48px', marginBottom: '12px'}}>⚕</div>
          <h3 style={{color: '#2C5F41', margin: '0 0 6px 0', fontSize: '16px'}}>No patients found</h3>
          <p style={{margin: '0 0 16px 0', fontSize: '12px'}}>Try adjusting your search criteria or add a new patient.</p>
          <Button variant="primary">Add New Patient</Button>
        </div>
      )}

      {showPatientModal && <PatientModal />}
    </div>
  );
};

export default PatientManagementScreen;
