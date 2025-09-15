import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Mock analytics data
    setTimeout(() => {
      setAnalyticsData({
        patientStats: {
          totalPatients: 145,
          newPatients: 12,
          activePatients: 98,
          recoveredPatients: 23
        },
        consultationStats: {
          totalConsultations: 234,
          completedConsultations: 189,
          scheduledConsultations: 45,
          averageDuration: 42
        },
        treatmentStats: {
          activeTreatments: 78,
          completedTreatments: 156,
          successRate: 87.5,
          averageTreatmentDuration: 28
        },
        revenueStats: {
          totalRevenue: 245000,
          monthlyGrowth: 12.5,
          averagePerPatient: 1690,
          topTreatments: [
            { name: 'Panchakarma', revenue: 89000, patients: 23 },
            { name: 'Herbal Medicine', revenue: 67000, patients: 45 },
            { name: 'Ayurvedic Consultation', revenue: 89000, patients: 77 }
          ]
        }
      });
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod]);

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

  const periodStyles = {
    display: 'flex',
    gap: '0.25rem', // Reduced from 0.5rem
    marginBottom: '0.75rem' // Reduced from 1.5rem
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', // Reduced from 250px
    gap: '0.75rem', // Reduced from 1rem
    marginBottom: '1rem' // Reduced from 2rem
  };

  const chartGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // Reduced from 400px
    gap: '1rem' // Reduced from 1.5rem
  };

  if (isLoading) {
    return (
      <div style={containerStyles}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.125rem', color: '#687076' }}>Loading analytics...</div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, change, icon, color }) => (
    <Card medical={true} padding="medium" hover={true}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '2rem', color: color || '#3E8E5A', marginBottom: '0.5rem' }}>
            {value}
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
            {title}
          </div>
          {change && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: change > 0 ? '#3E8E5A' : '#DC3545',
              fontWeight: '500'
            }}>
              {change > 0 ? '+' : ''}{change}% from last period
            </div>
          )}
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.7 }}>
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>Analytics Dashboard</h1>
        <Button variant="primary" size="medium">
          Export Report
        </Button>
      </div>

      <div style={periodStyles}>
        {['week', 'month', 'quarter', 'year'].map(period => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'primary' : 'outline'}
            size="small"
            onClick={() => setSelectedPeriod(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Patient Statistics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1rem' }}>
          Patient Statistics
        </h2>
        <div style={statsGridStyles}>
          <StatCard 
            title="Total Patients" 
            value={analyticsData.patientStats.totalPatients} 
            change={8.3}
            icon="⚕" 
          />
          <StatCard 
            title="New Patients" 
            value={analyticsData.patientStats.newPatients} 
            change={15.2}
            icon="👤" 
            color="#F4A261"
          />
          <StatCard 
            title="Active Patients" 
            value={analyticsData.patientStats.activePatients} 
            change={5.7}
            icon="💚" 
          />
          <StatCard 
            title="Recovered Patients" 
            value={analyticsData.patientStats.recoveredPatients} 
            change={12.1}
            icon="✨" 
            color="#17A2B8"
          />
        </div>
      </div>

      {/* Consultation Statistics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1rem' }}>
          Consultation Analytics
        </h2>
        <div style={statsGridStyles}>
          <StatCard 
            title="Total Consultations" 
            value={analyticsData.consultationStats.totalConsultations} 
            change={7.8}
            icon="🩺" 
          />
          <StatCard 
            title="Completed" 
            value={analyticsData.consultationStats.completedConsultations} 
            change={6.2}
            icon="✅" 
          />
          <StatCard 
            title="Scheduled" 
            value={analyticsData.consultationStats.scheduledConsultations} 
            change={23.5}
            icon="📅" 
            color="#F4A261"
          />
          <StatCard 
            title="Avg Duration (min)" 
            value={analyticsData.consultationStats.averageDuration} 
            change={-2.1}
            icon="⏱️" 
          />
        </div>
      </div>

      {/* Treatment Statistics */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1rem' }}>
          Treatment Analytics
        </h2>
        <div style={statsGridStyles}>
          <StatCard 
            title="Active Treatments" 
            value={analyticsData.treatmentStats.activeTreatments} 
            change={4.3}
            icon="🌿" 
          />
          <StatCard 
            title="Completed Treatments" 
            value={analyticsData.treatmentStats.completedTreatments} 
            change={9.1}
            icon="🎯" 
          />
          <StatCard 
            title="Success Rate %" 
            value={analyticsData.treatmentStats.successRate} 
            change={3.2}
            icon="📈" 
            color="#3E8E5A"
          />
          <StatCard 
            title="Avg Duration (days)" 
            value={analyticsData.treatmentStats.averageTreatmentDuration} 
            change={-5.4}
            icon="📊" 
          />
        </div>
      </div>

      {/* Revenue Analytics */}
      <div style={chartGridStyles}>
        <Card medical={true} padding="large">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1.5rem' }}>
            Revenue Overview
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3E8E5A', marginBottom: '0.25rem' }}>
              ₹{analyticsData.revenueStats.totalRevenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#687076' }}>
              Total Revenue ({selectedPeriod})
            </div>
            <div style={{ fontSize: '0.75rem', color: '#3E8E5A', marginTop: '0.25rem' }}>
              +{analyticsData.revenueStats.monthlyGrowth}% growth
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
              ₹{analyticsData.revenueStats.averagePerPatient}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#687076' }}>
              Average per patient
            </div>
          </div>
        </Card>

        <Card medical={true} padding="large">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2C5F41', marginBottom: '1.5rem' }}>
            Top Treatments by Revenue
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analyticsData.revenueStats.topTreatments.map((treatment, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#E8F5E8',
                borderRadius: '8px',
                border: '1px solid #3E8E5A30'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#2C5F41', fontSize: '0.875rem' }}>
                    {treatment.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#687076' }}>
                    {treatment.patients} patients
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#3E8E5A' }}>
                    ₹{treatment.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsScreen;