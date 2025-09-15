import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';

const ReportsScreen = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Mock data for medical reports
    setTimeout(() => {
      setReports([
        {
          id: 1,
          patientName: 'Priya Sharma',
          reportType: 'Lab Results',
          date: '2025-09-15',
          testName: 'Complete Blood Count (CBC)',
          status: 'ready',
          results: 'Normal ranges. Slight iron deficiency noted.',
          doctor: 'Dr. Sharma',
          category: 'laboratory'
        },
        {
          id: 2,
          patientName: 'Raj Kumar',
          reportType: 'Consultation Report',
          date: '2025-09-14',
          testName: 'Ayurvedic Constitution Analysis',
          status: 'ready',
          results: 'Predominant Pitta dosha with Vata imbalance.',
          doctor: 'Dr. Sharma',
          category: 'consultation'
        },
        {
          id: 3,
          patientName: 'Sunita Devi',
          reportType: 'Progress Report',
          date: '2025-09-13',
          testName: 'Monthly Health Assessment',
          status: 'ready',
          results: 'Significant improvement in digestive health. Continue current treatment.',
          doctor: 'Dr. Sharma',
          category: 'progress'
        },
        {
          id: 4,
          patientName: 'Amit Patel',
          reportType: 'Lab Results',
          date: '2025-09-12',
          testName: 'Lipid Profile',
          status: 'pending',
          results: 'Awaiting lab results...',
          doctor: 'Dr. Sharma',
          category: 'laboratory'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(report => 
    activeFilter === 'all' || report.category === activeFilter
  );

  const containerStyles = {
    padding: '1.5rem',
    backgroundColor: '#F5F7FA',
    minHeight: '100vh'
  };

  const headerStyles = {
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const titleStyles = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2C5F41',
    margin: 0
  };

  const filterStyles = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem'
  };

  const getStatusColor = (status) => {
    const colors = {
      ready: '#3E8E5A',
      pending: '#F4A261',
      review: '#17A2B8'
    };
    return colors[status] || '#687076';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      laboratory: '🧪',
      consultation: '🩺',
      progress: '📈',
      imaging: '🔬'
    };
    return icons[category] || '📋';
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#687076' }}>Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Medical Reports</h1>
        <Button variant="primary" size="medium">
          Generate Report
        </Button>
      </div>

      <div style={filterStyles}>
        {['all', 'laboratory', 'consultation', 'progress', 'imaging'].map(filter => (
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

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredReports.map(report => (
          <Card key={report.id} medical={true} padding="medium" hover={true}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>
                  {getCategoryIcon(report.category)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', margin: '0 0 0.25rem 0' }}>
                    {report.patientName}
                  </h3>
                  <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                    {report.testName} • {report.date} • {report.doctor}
                  </div>
                </div>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(report.status)}20`,
                color: getStatusColor(report.status)
              }}>
                {report.status.toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
                Report Type: {report.reportType}
              </h4>
            </div>

            <div style={{ 
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#E8F5E8',
              borderRadius: '8px',
              border: '1px solid #3E8E5A30'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.5rem' }}>
                Results:
              </h4>
              <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                {report.results}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" size="small">
                View Full Report
              </Button>
              <Button variant="secondary" size="small">
                Download PDF
              </Button>
              <Button variant="warning" size="small">
                Share
              </Button>
              {report.status === 'ready' && (
                <Button variant="success" size="small">
                  Mark Reviewed
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card medical={true} padding="large">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.5rem' }}>
              No reports found
            </h3>
            <p style={{ color: '#687076', marginBottom: '1.5rem' }}>
              No medical reports match the selected filter.
            </p>
            <Button variant="primary">Generate New Report</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsScreen;