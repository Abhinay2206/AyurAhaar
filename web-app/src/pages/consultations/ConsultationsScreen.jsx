import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';

const ConsultationsScreen = () => {
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Mock data for consultations
    setTimeout(() => {
      setConsultations([
        {
          id: 1,
          patientName: 'Priya Sharma',
          date: '2025-09-15',
          time: '10:00 AM',
          type: 'Initial Consultation',
          status: 'completed',
          notes: 'Patient complained of digestive issues. Recommended Vata-pacifying diet.',
          diagnosis: 'Vata Imbalance',
          duration: '45 min'
        },
        {
          id: 2,
          patientName: 'Raj Kumar',
          date: '2025-09-15',
          time: '2:30 PM',
          type: 'Follow-up',
          status: 'scheduled',
          notes: 'Review progress on previous treatment plan.',
          diagnosis: 'Pitta Dosha Excess',
          duration: '30 min'
        },
        {
          id: 3,
          patientName: 'Sunita Devi',
          date: '2025-09-14',
          time: '11:15 AM',
          type: 'Routine Check-up',
          status: 'completed',
          notes: 'Patient showing good improvement. Continue current regimen.',
          diagnosis: 'Kapha Imbalance',
          duration: '30 min'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredConsultations = consultations.filter(consultation => 
    activeFilter === 'all' || consultation.status === activeFilter
  );

  const containerStyles = {
    padding: '0.75rem', // Reduced from 1.5rem
    backgroundColor: '#F5F7FA',
    minHeight: '100vh'
  };

  const headerStyles = {
    marginBottom: '0.75rem', // Reduced from 1.5rem
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyles = {
    fontSize: '1.25rem', // Reduced from 1.5rem
    fontWeight: '700',
    color: '#2C5F41',
    margin: 0
  };

  const filterStyles = {
    display: 'flex',
    gap: '0.25rem', // Reduced from 0.5rem
    marginBottom: '0.75rem' // Reduced from 1.5rem
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#3E8E5A',
      scheduled: '#F4A261',
      cancelled: '#DC3545'
    };
    return colors[status] || '#687076';
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#687076' }}>Loading consultations...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Consultations</h1>
        <Button variant="primary" size="medium">
          New Consultation
        </Button>
      </div>

      <div style={filterStyles}>
        {['all', 'completed', 'scheduled', 'cancelled'].map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'primary' : 'outline'}
            size="small"
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {filteredConsultations.map(consultation => (
          <Card key={consultation.id} medical={true} padding="medium" hover={true}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#2C5F41', margin: '0 0 0.125rem 0' }}>
                  {consultation.patientName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#687076' }}>
                  {consultation.date} • {consultation.time} • {consultation.duration}
                </div>
              </div>
              <div style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(consultation.status)}20`,
                color: getStatusColor(consultation.status)
              }}>
                {consultation.status.toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.125rem' }}>
                Type: {consultation.type}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.125rem' }}>
                Diagnosis: {consultation.diagnosis}
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#687076', marginBottom: '1rem' }}>
              {consultation.notes}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" size="small">
                View Details
              </Button>
              <Button variant="secondary" size="small">
                Edit Notes
              </Button>
              {consultation.status === 'scheduled' && (
                <Button variant="warning" size="small">
                  Reschedule
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredConsultations.length === 0 && (
        <Card medical={true} padding="large">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🩺</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.5rem' }}>
              No consultations found
            </h3>
            <p style={{ color: '#687076', marginBottom: '1.5rem' }}>
              No consultations match the selected filter.
            </p>
            <Button variant="primary">Schedule New Consultation</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ConsultationsScreen;