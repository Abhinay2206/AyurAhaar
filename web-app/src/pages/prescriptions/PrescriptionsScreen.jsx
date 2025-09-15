import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { PrescriptionService } from '../../services';

const PrescriptionsScreen = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await PrescriptionService.getAllPrescriptions();
      setPrescriptions(response.data || response);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
      setError('Failed to load prescriptions');
      // Fallback to mock data
      setPrescriptions([
        {
          id: 1,
          patientName: 'Priya Sharma',
          prescriptionId: 'RX-2025-001',
          date: '2025-09-15',
          medicines: [
            { name: 'Ashwagandha Churna', dosage: '1 tsp twice daily', duration: '30 days' },
            { name: 'Triphala Tablets', dosage: '2 tablets before bed', duration: '30 days' }
          ],
          instructions: 'Take with warm water. Avoid spicy foods.',
          status: 'active',
          doctor: 'Dr. Sharma'
        },
        {
          id: 2,
          patientName: 'Raj Kumar',
          prescriptionId: 'RX-2025-002',
          date: '2025-09-14',
          medicines: [
            { name: 'Brahmi Ghrita', dosage: '1/2 tsp with milk', duration: '21 days' },
            { name: 'Saraswatarishta', dosage: '15ml twice daily', duration: '21 days' }
          ],
          instructions: 'Take after meals. Practice meditation.',
          status: 'completed',
          doctor: 'Dr. Sharma'
        },
        {
          id: 3,
          patientName: 'Sunita Devi',
          prescriptionId: 'RX-2025-003',
          date: '2025-09-13',
          medicines: [
            { name: 'Trikatu Churna', dosage: '1/4 tsp with honey', duration: '15 days' },
            { name: 'Ginger Tea', dosage: 'One cup morning', duration: '15 days' }
          ],
          instructions: 'Take before breakfast. Avoid cold drinks.',
          status: 'active',
          doctor: 'Dr. Sharma'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => 
    activeFilter === 'all' || prescription.status === activeFilter
  );

  const containerStyles = {
    padding: '0.75rem', // Reduced from 1.5rem to match dashboard
    backgroundColor: '#F5F7FA',
    minHeight: '100vh'
  };

  const headerStyles = {
    marginBottom: '0.75rem', // Reduced from 1.5rem to match dashboard
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyles = {
    fontSize: '1.25rem', // Reduced from 1.5rem to match dashboard
    fontWeight: '700',
    color: '#2C5F41',
    margin: 0
  };

  const filterStyles = {
    display: 'flex',
    gap: '0.25rem', // Reduced from 0.5rem to match dashboard
    marginBottom: '0.75rem' // Reduced from 1.5rem to match dashboard
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#3E8E5A',
      completed: '#687076',
      expired: '#DC3545'
    };
    return colors[status] || '#687076';
  };

  const handlePrintPrescription = async (prescriptionId) => {
    try {
      await PrescriptionService.printPrescription(prescriptionId);
      // Handle print success (e.g., show success message)
    } catch (err) {
      console.error('Error printing prescription:', err);
      // Handle print error
    }
  };

  const handleEditPrescription = async (prescriptionId) => {
    try {
      // Navigate to edit prescription form or open modal
      // This would typically use React Router or a modal
      console.log('Edit prescription:', prescriptionId);
    } catch (err) {
      console.error('Error editing prescription:', err);
    }
  };

  const handleRenewPrescription = async (prescriptionId) => {
    try {
      await PrescriptionService.renewPrescription(prescriptionId);
      // Refresh the prescriptions list
      loadPrescriptions();
    } catch (err) {
      console.error('Error renewing prescription:', err);
    }
  };

  const handleCreatePrescription = () => {
    // Navigate to create prescription form
    console.log('Create new prescription');
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1rem', color: '#687076' }}>Loading prescriptions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <Card medical={true} padding="large">
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#DC3545' }}>⚠️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#DC3545', marginBottom: '0.25rem' }}>
              Error Loading Prescriptions
            </h3>
            <p style={{ color: '#687076', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              {error}
            </p>
            <Button variant="primary" onClick={loadPrescriptions}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Prescriptions</h1>
        <Button variant="primary" size="medium" onClick={handleCreatePrescription}>
          New Prescription
        </Button>
      </div>

      <div style={filterStyles}>
        {['all', 'active', 'completed', 'expired'].map(filter => (
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
        {filteredPrescriptions.map(prescription => (
          <Card key={prescription.id} medical={true} padding="medium" hover={true}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#2C5F41', margin: '0 0 0.125rem 0' }}>
                  {prescription.patientName}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#687076' }}>
                  {prescription.prescriptionId} • {prescription.date} • {prescription.doctor}
                </div>
              </div>
              <div style={{
                padding: '0.125rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(prescription.status)}20`,
                color: getStatusColor(prescription.status)
              }}>
                {prescription.status.toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
                Medicines:
              </h4>
              {prescription.medicines.map((medicine, index) => (
                <div key={index} style={{ 
                  marginBottom: '0.25rem', 
                  padding: '0.375rem', 
                  backgroundColor: '#E8F5E8', 
                  borderRadius: '6px',
                  border: '1px solid #3E8E5A30'
                }}>
                  <div style={{ fontWeight: '600', color: '#2C5F41', fontSize: '0.8rem' }}>
                    {medicine.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#687076' }}>
                    {medicine.dosage} • {medicine.duration}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.125rem' }}>
                Instructions:
              </h4>
              <div style={{ fontSize: '0.8rem', color: '#687076' }}>
                {prescription.instructions}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => handlePrintPrescription(prescription.id)}
              >
                Print
              </Button>
              <Button 
                variant="secondary" 
                size="small"
                onClick={() => handleEditPrescription(prescription.id)}
              >
                Edit
              </Button>
              <Button 
                variant="warning" 
                size="small"
                onClick={() => handleRenewPrescription(prescription.id)}
              >
                Renew
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredPrescriptions.length === 0 && (
        <Card medical={true} padding="large">
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚕</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
              No prescriptions found
            </h3>
            <p style={{ color: '#687076', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              No prescriptions match the selected filter.
            </p>
            <Button variant="primary" onClick={handleCreatePrescription}>Create New Prescription</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PrescriptionsScreen;