import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Input } from '../../components';
import { formatDate, getBMICategory, getPrakritiColor } from '../../utils';
import { ApiService } from '../../services';
import './PatientManagement.css';

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
      case 'Active': return '#16a34a';
      case 'Completed': return '#059669';
      case 'Inactive': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const PatientModal = () => {
    if (!selectedPatient) return null;

    return (
      <div className="patient-modal-overlay" onClick={() => setShowPatientModal(false)}>
        <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedPatient.name}</h2>
            <button 
              className="close-btn"
              onClick={() => setShowPatientModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <div className="patient-details-grid">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-item">
                  <span>Patient ID:</span>
                  <span>{selectedPatient.patient_id}</span>
                </div>
                <div className="detail-item">
                  <span>Age:</span>
                  <span>{selectedPatient.age} years</span>
                </div>
                <div className="detail-item">
                  <span>Gender:</span>
                  <span>{selectedPatient.gender === 'M' ? 'Male' : 'Female'}</span>
                </div>
                <div className="detail-item">
                  <span>Phone:</span>
                  <span>{selectedPatient.phone}</span>
                </div>
                <div className="detail-item">
                  <span>Email:</span>
                  <span>{selectedPatient.email}</span>
                </div>
                <div className="detail-item">
                  <span>Address:</span>
                  <span>{selectedPatient.address}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Health Profile</h3>
                <div className="detail-item">
                  <span>Height:</span>
                  <span>{selectedPatient.height_cm} cm</span>
                </div>
                <div className="detail-item">
                  <span>Weight:</span>
                  <span>{selectedPatient.weight_kg} kg</span>
                </div>
                <div className="detail-item">
                  <span>BMI:</span>
                  <span>{selectedPatient.BMI} ({getBMICategory(selectedPatient.BMI)})</span>
                </div>
                <div className="detail-item">
                  <span>Prakriti:</span>
                  <span style={{color: getPrakritiColor(selectedPatient.prakriti)}}>
                    {selectedPatient.prakriti}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Lifestyle:</span>
                  <span>{selectedPatient.lifestyle}</span>
                </div>
                <div className="detail-item">
                  <span>Health Conditions:</span>
                  <span>{selectedPatient.health_conditions}</span>
                </div>
                <div className="detail-item">
                  <span>Allergies:</span>
                  <span>{selectedPatient.allergies}</span>
                </div>
                <div className="detail-item">
                  <span>Preferred Cuisine:</span>
                  <span>{selectedPatient.preferred_cuisine}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Treatment Information</h3>
                <div className="detail-item">
                  <span>Status:</span>
                  <span style={{color: getStatusColor(selectedPatient.treatment_status)}}>
                    {selectedPatient.treatment_status}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Joining Date:</span>
                  <span>{formatDate(selectedPatient.joining_date)}</span>
                </div>
                <div className="detail-item">
                  <span>Last Visit:</span>
                  <span>{formatDate(selectedPatient.last_visit)}</span>
                </div>
                <div className="detail-item">
                  <span>Next Appointment:</span>
                  <span>
                    {selectedPatient.next_appointment 
                      ? formatDate(selectedPatient.next_appointment)
                      : 'Not scheduled'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
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
      <div className="patient-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Patient Management</h1>
          <p>Manage and monitor your patients' health journey</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">Add New Patient</Button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <Input
            type="text"
            placeholder="Search patients by name, ID, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterCriteria.prakriti}
            onChange={(e) => setFilterCriteria({...filterCriteria, prakriti: e.target.value})}
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
          >
            <option value="all">All Ages</option>
            <option value="young">Under 30</option>
            <option value="middle">30-50</option>
            <option value="senior">Over 50</option>
          </select>

          <select
            value={filterCriteria.lifestyle}
            onChange={(e) => setFilterCriteria({...filterCriteria, lifestyle: e.target.value})}
          >
            <option value="all">All Lifestyles</option>
            <option value="sedentary">Sedentary</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      <div className="patients-grid">
        {filteredPatients.map(patient => (
          <Card 
            key={patient.patient_id} 
            className="patient-card"
            onClick={() => handlePatientSelect(patient)}
          >
            <div className="patient-card-header">
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <p className="patient-id">{patient.patient_id}</p>
              </div>
              <div 
                className="status-badge"
                style={{backgroundColor: getStatusColor(patient.treatment_status)}}
              >
                {patient.treatment_status}
              </div>
            </div>

            <div className="patient-details">
              <div className="detail-row">
                <span>Age: {patient.age} | {patient.gender === 'M' ? 'Male' : 'Female'}</span>
              </div>
              <div className="detail-row">
                <span>BMI: {patient.BMI} ({getBMICategory(patient.BMI)})</span>
              </div>
              <div className="detail-row">
                <span 
                  className="prakriti-badge"
                  style={{color: getPrakritiColor(patient.prakriti)}}
                >
                  Prakriti: {patient.prakriti}
                </span>
              </div>
              <div className="detail-row">
                <span>Conditions: {patient.health_conditions}</span>
              </div>
              <div className="detail-row">
                <span>Last Visit: {formatDate(patient.last_visit)}</span>
              </div>
              {patient.next_appointment && (
                <div className="detail-row next-appointment">
                  <span>Next: {formatDate(patient.next_appointment)}</span>
                </div>
              )}
            </div>

            <div className="patient-actions">
              <button className="action-btn">View Plan</button>
              <button className="action-btn">Appointment</button>
              <button className="action-btn">History</button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No patients found</h3>
          <p>Try adjusting your search criteria or add a new patient.</p>
          <Button variant="primary">Add New Patient</Button>
        </div>
      )}

      {showPatientModal && <PatientModal />}
    </div>
  );
};

export default PatientManagementScreen;
