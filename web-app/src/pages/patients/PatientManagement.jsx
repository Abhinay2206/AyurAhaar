import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../components';
import { PatientService, AppointmentService, MealPlanService } from '../../services';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    loadPatients();
  }, [filterStatus]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real app, this would be API call
      const mockPatients = [
        {
          _id: '1',
          name: 'Priya Sharma',
          email: 'priya.sharma@email.com',
          phone: '9876543210',
          age: 34,
          constitution: 'Vata-Pitta',
          condition: 'Digestive Issues',
          status: 'active',
          lastVisit: '2024-09-10',
          nextAppointment: '2024-09-15',
          currentPlan: {
            type: 'ai',
            isActive: true,
            progress: 75
          }
        },
        {
          _id: '2',
          name: 'Rohit Patel',
          email: 'rohit.patel@email.com',
          phone: '9876543211',
          age: 28,
          constitution: 'Kapha',
          condition: 'Weight Management',
          status: 'follow-up',
          lastVisit: '2024-09-09',
          nextAppointment: null,
          currentPlan: {
            type: 'custom',
            isActive: true,
            progress: 45
          }
        },
        {
          _id: '3',
          name: 'Anita Singh',
          email: 'anita.singh@email.com',
          phone: '9876543212',
          age: 42,
          constitution: 'Pitta',
          condition: 'Stress & Anxiety',
          status: 'active',
          lastVisit: '2024-09-08',
          nextAppointment: '2024-09-16',
          currentPlan: {
            type: 'ai',
            isActive: true,
            progress: 90
          }
        }
      ];
      
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    // Load detailed patient information
    try {
      // Mock detailed data
      const mockDetails = {
        ...patient,
        weight: 65,
        height: 165,
        lifestyle: 'Sedentary',
        allergies: ['Dairy', 'Nuts'],
        healthConditions: ['Hypertension'],
        recentAppointments: [
          {
            date: '2024-09-10',
            type: 'Consultation',
            notes: 'Patient showing improvement in digestive symptoms'
          }
        ],
        mealPlanHistory: [
          {
            id: 1,
            type: 'AI Generated',
            startDate: '2024-09-01',
            status: 'active',
            progress: 75
          }
        ]
      };
      setPatientDetails(mockDetails);
    } catch (error) {
      console.error('Error loading patient details:', error);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const containerStyles = {
    padding: '2rem',
    backgroundColor: 'var(--medical-gray-50)',
    minHeight: '100vh'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };

  const contentStyles = {
    display: 'grid',
    gridTemplateColumns: selectedPatient ? '1fr 1fr' : '1fr',
    gap: '2rem',
    transition: 'all var(--transition-base)'
  };

  const filterStyles = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    alignItems: 'center'
  };

  const patientListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const patientCardStyles = (isSelected) => ({
    padding: '1.5rem',
    border: `2px solid ${isSelected ? 'var(--medical-primary)' : 'var(--medical-gray-200)'}`,
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    backgroundColor: isSelected ? 'var(--medical-primary-light)' : 'var(--medical-white)'
  });

  const statusBadgeStyles = (status) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: 
      status === 'active' ? 'var(--medical-success-light)' :
      status === 'follow-up' ? 'var(--medical-warning-light)' :
      'var(--medical-gray-200)',
    color:
      status === 'active' ? 'var(--medical-success-dark)' :
      status === 'follow-up' ? 'var(--medical-warning-dark)' :
      'var(--medical-gray-600)'
  });

  const renderPatientList = () => (
    <Card medical={true} padding="large" hover={false}>
      <div style={headerStyles}>
        <h2 style={{ margin: 0, color: 'var(--medical-gray-800)' }}>Patients</h2>
        <Button variant="primary" onClick={() => alert('Add patient functionality coming soon')}>
          + Add New Patient
        </Button>
      </div>

      <div style={filterStyles}>
        <Input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          }
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid var(--medical-gray-300)',
            borderRadius: 'var(--radius-md)',
            fontSize: '1rem'
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="follow-up">Follow-up</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading patients...</div>
        </div>
      ) : (
        <div style={patientListStyles}>
          {filteredPatients.map(patient => (
            <div
              key={patient._id}
              style={patientCardStyles(selectedPatient?._id === patient._id)}
              onClick={() => handlePatientSelect(patient)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>{patient.name}</h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                    Age {patient.age} • {patient.constitution}
                  </div>
                </div>
                <span style={statusBadgeStyles(patient.status)}>
                  {patient.status}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                <div>Condition: {patient.condition}</div>
                <div>Last Visit: {patient.lastVisit}</div>
                {patient.nextAppointment && (
                  <>
                    <div>Next Appointment: {patient.nextAppointment}</div>
                    <div>Plan Progress: {patient.currentPlan.progress}%</div>
                  </>
                )}
              </div>
              
              {patient.currentPlan.isActive && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span>Current Plan Progress</span>
                    <span>{patient.currentPlan.progress}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'var(--medical-gray-200)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${patient.currentPlan.progress}%`,
                      height: '100%',
                      backgroundColor: 'var(--medical-success)',
                      transition: 'width var(--transition-base)'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const renderPatientDetails = () => {
    if (!selectedPatient || !patientDetails) return null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Patient Info Card */}
        <Card medical={true} padding="large" hover={false}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>{patientDetails.name}</h2>
              <div style={{ color: 'var(--medical-gray-600)' }}>{patientDetails.email}</div>
              <div style={{ color: 'var(--medical-gray-600)' }}>{patientDetails.phone}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="small">Edit Profile</Button>
              <Button variant="primary" size="small">Schedule Appointment</Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <strong>Age:</strong> {patientDetails.age}
            </div>
            <div>
              <strong>Constitution:</strong> {patientDetails.constitution}
            </div>
            <div>
              <strong>Weight:</strong> {patientDetails.weight} kg
            </div>
            <div>
              <strong>Height:</strong> {patientDetails.height} cm
            </div>
            <div>
              <strong>Lifestyle:</strong> {patientDetails.lifestyle}
            </div>
            <div>
              <strong>Condition:</strong> {patientDetails.condition}
            </div>
          </div>

          {patientDetails.allergies && patientDetails.allergies.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Allergies:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {patientDetails.allergies.map(allergy => (
                  <span key={allergy} style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'var(--medical-error-light)',
                    color: 'var(--medical-error-dark)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}>
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {patientDetails.healthConditions && patientDetails.healthConditions.length > 0 && (
            <div>
              <strong>Health Conditions:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {patientDetails.healthConditions.map(condition => (
                  <span key={condition} style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'var(--medical-warning-light)',
                    color: 'var(--medical-warning-dark)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}>
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Current Meal Plan */}
        <Card medical={true} padding="large" hover={false}>
          <h3 style={{ marginBottom: '1rem' }}>Current Meal Plan</h3>
          {patientDetails.currentPlan.isActive ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{patientDetails.currentPlan.type} Plan</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                    Progress: {patientDetails.currentPlan.progress}%
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="secondary" size="small">View Details</Button>
                  <Button variant="primary" size="small">Update Plan</Button>
                </div>
              </div>
              
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--medical-gray-200)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: `${patientDetails.currentPlan.progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--medical-success)',
                  transition: 'width var(--transition-base)'
                }}></div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ marginBottom: '1rem', color: 'var(--medical-gray-600)' }}>
                No active meal plan
              </div>
              <Button variant="primary">Create New Plan</Button>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card medical={true} padding="large" hover={false}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patientDetails.recentAppointments.map((appointment, index) => (
              <div key={index} style={{
                padding: '1rem',
                border: '1px solid var(--medical-gray-200)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>{appointment.type}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                    {appointment.date}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                  {appointment.notes}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div style={containerStyles}>
      <div style={contentStyles}>
        {renderPatientList()}
        {selectedPatient && renderPatientDetails()}
      </div>
    </div>
  );
};

export default PatientManagement;