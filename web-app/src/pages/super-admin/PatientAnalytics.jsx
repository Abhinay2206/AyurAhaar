import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components';
import { formatDate } from '../../utils';
import './PatientAnalytics.css';

const PatientAnalytics = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    prakriti: 'all',
    ageGroup: 'all',
    healthCondition: 'all',
    lifestyle: 'all'
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    // Mock patient data based on CSV structure
    const mockPatients = [
      {
        id: 'P0001',
        name: 'Rajesh Kumar',
        age: 56,
        gender: 'Male',
        prakriti: 'Kapha',
        health_conditions: 'None',
        allergies: 'None',
        weight: 76.2,
        height: 171,
        bmi: 26.1,
        lifestyle: 'sedentary',
        preferred_cuisine: 'Chinese',
        registration_date: '2024-01-15',
        last_consultation: '2024-03-10',
        consultations_count: 8,
        meal_plans: 3,
        doctor_assigned: 'Dr. Priya Sharma',
        status: 'active'
      },
      {
        id: 'P0002',
        name: 'Priya Sharma',
        age: 36,
        gender: 'Female',
        prakriti: 'Vata',
        health_conditions: 'Obesity',
        allergies: 'peanuts',
        weight: 61.4,
        height: 174,
        bmi: 20.3,
        lifestyle: 'sedentary',
        preferred_cuisine: 'North Indian',
        registration_date: '2024-02-08',
        last_consultation: '2024-03-12',
        consultations_count: 5,
        meal_plans: 2,
        doctor_assigned: 'Dr. Amit Patel',
        status: 'active'
      },
      {
        id: 'P0003',
        name: 'Anita Reddy',
        age: 20,
        gender: 'Female',
        prakriti: 'Vata',
        health_conditions: 'Hypertension',
        allergies: 'peanuts',
        weight: 66.2,
        height: 159,
        bmi: 26.2,
        lifestyle: 'sedentary',
        preferred_cuisine: 'North Indian',
        registration_date: '2024-01-20',
        last_consultation: '2024-03-08',
        consultations_count: 12,
        meal_plans: 4,
        doctor_assigned: 'Dr. Sunita Reddy',
        status: 'active'
      },
      {
        id: 'P0004',
        name: 'Vikram Singh',
        age: 45,
        gender: 'Male',
        prakriti: 'Pitta',
        health_conditions: 'Diabetes',
        allergies: 'None',
        weight: 82.5,
        height: 175,
        bmi: 26.9,
        lifestyle: 'active',
        preferred_cuisine: 'South Indian',
        registration_date: '2023-12-10',
        last_consultation: '2024-03-05',
        consultations_count: 15,
        meal_plans: 6,
        doctor_assigned: 'Dr. Rajesh Kumar',
        status: 'active'
      },
      {
        id: 'P0005',
        name: 'Meera Joshi',
        age: 28,
        gender: 'Female',
        prakriti: 'Kapha',
        health_conditions: 'PCOD',
        allergies: 'dairy',
        weight: 58.3,
        height: 162,
        bmi: 22.2,
        lifestyle: 'moderate',
        preferred_cuisine: 'Gujarati',
        registration_date: '2024-01-25',
        last_consultation: '2024-03-11',
        consultations_count: 7,
        meal_plans: 3,
        doctor_assigned: 'Dr. Priya Sharma',
        status: 'active'
      }
    ];

    setPatients(mockPatients);

    // Calculate analytics
    const totalPatients = mockPatients.length;
    const prakritiDistribution = mockPatients.reduce((acc, patient) => {
      acc[patient.prakriti] = (acc[patient.prakriti] || 0) + 1;
      return acc;
    }, {});

    const ageGroups = {
      '18-30': mockPatients.filter(p => p.age >= 18 && p.age <= 30).length,
      '31-45': mockPatients.filter(p => p.age >= 31 && p.age <= 45).length,
      '46-60': mockPatients.filter(p => p.age >= 46 && p.age <= 60).length,
      '60+': mockPatients.filter(p => p.age > 60).length
    };

    const healthConditions = mockPatients.reduce((acc, patient) => {
      const condition = patient.health_conditions === 'None' ? 'Healthy' : patient.health_conditions;
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    setAnalytics({
      totalPatients,
      activePatients: mockPatients.filter(p => p.status === 'active').length,
      averageAge: Math.round(mockPatients.reduce((sum, p) => sum + p.age, 0) / totalPatients),
      averageBMI: (mockPatients.reduce((sum, p) => sum + p.bmi, 0) / totalPatients).toFixed(1),
      prakritiDistribution,
      ageGroups,
      healthConditions,
      totalConsultations: mockPatients.reduce((sum, p) => sum + p.consultations_count, 0),
      totalMealPlans: mockPatients.reduce((sum, p) => sum + p.meal_plans, 0)
    });
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.doctor_assigned.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrakriti = filters.prakriti === 'all' || patient.prakriti === filters.prakriti;
    const matchesAgeGroup = filters.ageGroup === 'all' || 
      (filters.ageGroup === '18-30' && patient.age >= 18 && patient.age <= 30) ||
      (filters.ageGroup === '31-45' && patient.age >= 31 && patient.age <= 45) ||
      (filters.ageGroup === '46-60' && patient.age >= 46 && patient.age <= 60) ||
      (filters.ageGroup === '60+' && patient.age > 60);
    
    const matchesHealthCondition = filters.healthCondition === 'all' || 
      patient.health_conditions.toLowerCase().includes(filters.healthCondition.toLowerCase());
    
    const matchesLifestyle = filters.lifestyle === 'all' || patient.lifestyle === filters.lifestyle;

    return matchesSearch && matchesPrakriti && matchesAgeGroup && matchesHealthCondition && matchesLifestyle;
  });

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6' };
    if (bmi < 25) return { category: 'Normal', color: '#10b981' };
    if (bmi < 30) return { category: 'Overweight', color: '#f59e0b' };
    return { category: 'Obese', color: '#ef4444' };
  };

  const getPrakritiColor = (prakriti) => {
    const colors = {
      'Vata': '#8b5cf6',
      'Pitta': '#f59e0b', 
      'Kapha': '#10b981'
    };
    return colors[prakriti] || '#6b7280';
  };

  const AnalyticsCard = ({ title, value, subtitle, icon, color }) => (
    <Card className={`analytics-card ${color}`}>
      <div className="analytics-content">
        <div className="analytics-icon">{icon}</div>
        <div className="analytics-info">
          <h3>{value}</h3>
          <p className="analytics-title">{title}</p>
          {subtitle && <span className="analytics-subtitle">{subtitle}</span>}
        </div>
      </div>
    </Card>
  );

  const PatientDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="patient-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Patient Details</h2>
          <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
        </div>
        
        {selectedPatient && (
          <div className="modal-content">
            <div className="patient-overview">
              <div className="patient-basic-info">
                <h3>{selectedPatient.name}</h3>
                <p className="patient-id">{selectedPatient.id}</p>
                <span 
                  className="prakriti-badge"
                  style={{ backgroundColor: getPrakritiColor(selectedPatient.prakriti) }}
                >
                  {selectedPatient.prakriti}
                </span>
              </div>
              
              <div className="patient-metrics">
                <div className="metric">
                  <span className="label">Age</span>
                  <span className="value">{selectedPatient.age} years</span>
                </div>
                <div className="metric">
                  <span className="label">BMI</span>
                  <span 
                    className="value"
                    style={{ color: getBMICategory(selectedPatient.bmi).color }}
                  >
                    {selectedPatient.bmi} ({getBMICategory(selectedPatient.bmi).category})
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Lifestyle</span>
                  <span className="value">{selectedPatient.lifestyle}</span>
                </div>
              </div>
            </div>

            <div className="patient-details-grid">
              <div className="detail-section">
                <h4>Health Information</h4>
                <div className="detail-item">
                  <span className="label">Conditions:</span>
                  <span className="value">{selectedPatient.health_conditions}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Allergies:</span>
                  <span className="value">{selectedPatient.allergies}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Weight:</span>
                  <span className="value">{selectedPatient.weight} kg</span>
                </div>
                <div className="detail-item">
                  <span className="label">Height:</span>
                  <span className="value">{selectedPatient.height} cm</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Treatment History</h4>
                <div className="detail-item">
                  <span className="label">Doctor:</span>
                  <span className="value">{selectedPatient.doctor_assigned}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Consultations:</span>
                  <span className="value">{selectedPatient.consultations_count}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Meal Plans:</span>
                  <span className="value">{selectedPatient.meal_plans}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Last Visit:</span>
                  <span className="value">{formatDate(selectedPatient.last_consultation)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Preferences</h4>
                <div className="detail-item">
                  <span className="label">Cuisine:</span>
                  <span className="value">{selectedPatient.preferred_cuisine}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Registration:</span>
                  <span className="value">{formatDate(selectedPatient.registration_date)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="modal-actions">
          <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            Edit Patient
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="patient-analytics">
      <div className="page-header">
        <div className="header-content">
          <h1>👥 Patient Analytics</h1>
          <p>Comprehensive patient data analysis and insights</p>
        </div>
        <div className="header-actions">
          <Button variant="outline">📊 Export Report</Button>
          <Button variant="primary">📈 Advanced Analytics</Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="analytics-grid">
        <AnalyticsCard
          title="Total Patients"
          value={analytics.totalPatients}
          subtitle={`${analytics.activePatients} active`}
          icon="👥"
          color="blue"
        />
        <AnalyticsCard
          title="Average Age"
          value={`${analytics.averageAge} years`}
          icon="📅"
          color="green"
        />
        <AnalyticsCard
          title="Average BMI"
          value={analytics.averageBMI}
          icon="⚖️"
          color="orange"
        />
        <AnalyticsCard
          title="Total Consultations"
          value={analytics.totalConsultations}
          icon="🩺"
          color="purple"
        />
      </div>

      {/* Distribution Charts */}
      <div className="charts-row">
        <Card className="chart-card">
          <h3>📊 Prakriti Distribution</h3>
          <div className="chart-content">
            {Object.entries(analytics.prakritiDistribution || {}).map(([prakriti, count]) => (
              <div key={prakriti} className="chart-item">
                <div className="chart-label">
                  <span 
                    className="chart-color"
                    style={{ backgroundColor: getPrakritiColor(prakriti) }}
                  ></span>
                  {prakriti}
                </div>
                <div className="chart-value">{count}</div>
                <div 
                  className="chart-bar"
                  style={{ 
                    width: `${(count / analytics.totalPatients) * 100}%`,
                    backgroundColor: getPrakritiColor(prakriti)
                  }}
                ></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="chart-card">
          <h3>📈 Age Groups</h3>
          <div className="chart-content">
            {Object.entries(analytics.ageGroups || {}).map(([ageGroup, count]) => (
              <div key={ageGroup} className="chart-item">
                <div className="chart-label">{ageGroup}</div>
                <div className="chart-value">{count}</div>
                <div 
                  className="chart-bar"
                  style={{ 
                    width: `${(count / analytics.totalPatients) * 100}%`,
                    backgroundColor: '#3b82f6'
                  }}
                ></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="chart-card">
          <h3>🏥 Health Conditions</h3>
          <div className="chart-content">
            {Object.entries(analytics.healthConditions || {}).map(([condition, count]) => (
              <div key={condition} className="chart-item">
                <div className="chart-label">{condition}</div>
                <div className="chart-value">{count}</div>
                <div 
                  className="chart-bar"
                  style={{ 
                    width: `${(count / analytics.totalPatients) * 100}%`,
                    backgroundColor: condition === 'Healthy' ? '#10b981' : '#f59e0b'
                  }}
                ></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="filters-card">
        <div className="filters-header">
          <h3>🔍 Patient Search & Filters</h3>
        </div>
        
        <div className="filters-content">
          <div className="search-section">
            <Input
              type="text"
              placeholder="Search by name, ID, or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon="🔍"
            />
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Prakriti</label>
              <select 
                value={filters.prakriti} 
                onChange={(e) => setFilters({...filters, prakriti: e.target.value})}
              >
                <option value="all">All Prakritis</option>
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Age Group</label>
              <select 
                value={filters.ageGroup} 
                onChange={(e) => setFilters({...filters, ageGroup: e.target.value})}
              >
                <option value="all">All Ages</option>
                <option value="18-30">18-30 years</option>
                <option value="31-45">31-45 years</option>
                <option value="46-60">46-60 years</option>
                <option value="60+">60+ years</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Lifestyle</label>
              <select 
                value={filters.lifestyle} 
                onChange={(e) => setFilters({...filters, lifestyle: e.target.value})}
              >
                <option value="all">All Lifestyles</option>
                <option value="sedentary">Sedentary</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Health Condition</label>
              <input 
                type="text"
                placeholder="Filter by condition..."
                value={filters.healthCondition}
                onChange={(e) => setFilters({...filters, healthCondition: e.target.value})}
              />
            </div>
          </div>

          <div className="filter-actions">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({
                  prakriti: 'all',
                  ageGroup: 'all',
                  healthCondition: 'all',
                  lifestyle: 'all'
                });
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
            <span className="results-count">
              Showing {filteredPatients.length} of {patients.length} patients
            </span>
          </div>
        </div>
      </Card>

      {/* Patient List */}
      <Card className="patients-list-card">
        <div className="list-header">
          <h3>📋 Patient List</h3>
          <Button variant="outline" size="small">Export List</Button>
        </div>

        <div className="patients-table">
          <div className="table-header">
            <div className="table-cell">Patient</div>
            <div className="table-cell">Prakriti</div>
            <div className="table-cell">Age/BMI</div>
            <div className="table-cell">Health</div>
            <div className="table-cell">Doctor</div>
            <div className="table-cell">Consultations</div>
            <div className="table-cell">Actions</div>
          </div>

          <div className="table-body">
            {filteredPatients.map(patient => (
              <div key={patient.id} className="table-row">
                <div className="table-cell patient-info">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-id">{patient.id}</div>
                </div>
                <div className="table-cell">
                  <span 
                    className="prakriti-tag"
                    style={{ backgroundColor: getPrakritiColor(patient.prakriti) }}
                  >
                    {patient.prakriti}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="age-bmi">
                    <span>{patient.age}y</span>
                    <span 
                      className="bmi"
                      style={{ color: getBMICategory(patient.bmi).color }}
                    >
                      BMI {patient.bmi}
                    </span>
                  </div>
                </div>
                <div className="table-cell">
                  <span className="health-condition">{patient.health_conditions}</span>
                  {patient.allergies !== 'None' && (
                    <span className="allergies">⚠️ {patient.allergies}</span>
                  )}
                </div>
                <div className="table-cell doctor-name">
                  {patient.doctor_assigned}
                </div>
                <div className="table-cell consultations">
                  <span className="consultation-count">{patient.consultations_count}</span>
                  <span className="meal-plans">{patient.meal_plans} plans</span>
                </div>
                <div className="table-cell actions">
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowDetailsModal(true);
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {showDetailsModal && <PatientDetailsModal />}
    </div>
  );
};

export default PatientAnalytics;
