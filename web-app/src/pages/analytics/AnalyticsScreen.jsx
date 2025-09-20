import React, { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import ApiService from '../../services/api';

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch analytics data from API
  const fetchAnalyticsData = async (period) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [
        patientStats,
        consultationStats,
        treatmentStats,
        revenueStats
      ] = await Promise.all([
        ApiService.getPatientAnalytics(period),
        ApiService.getConsultationAnalytics(period),
        ApiService.getTreatmentAnalytics(period),
        ApiService.getRevenueAnalytics(period)
      ]);

      setAnalyticsData({
        patientStats: patientStats.data || patientStats,
        consultationStats: consultationStats.data || consultationStats,
        treatmentStats: treatmentStats.data || treatmentStats,
        revenueStats: revenueStats.data || revenueStats
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Using demo data.');
      
      // Fallback to mock data if API fails
      setAnalyticsData({
        patientStats: {
          totalPatients: 145,
          newPatients: 12,
          activePatients: 98,
          recoveredPatients: 23,
          growth: {
            totalPatients: 8.3,
            newPatients: 15.2,
            activePatients: 5.7,
            recoveredPatients: 12.1
          }
        },
        consultationStats: {
          totalConsultations: 234,
          completedConsultations: 189,
          scheduledConsultations: 45,
          averageDuration: 42,
          growth: {
            totalConsultations: 7.8,
            completedConsultations: 6.2,
            scheduledConsultations: 23.5,
            averageDuration: -2.1
          }
        },
        treatmentStats: {
          activeTreatments: 78,
          completedTreatments: 156,
          successRate: 87.5,
          averageTreatmentDuration: 28,
          growth: {
            activeTreatments: 4.3,
            completedTreatments: 9.1,
            successRate: 3.2,
            averageTreatmentDuration: -5.4
          }
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(selectedPeriod);
  }, [selectedPeriod]);

  // Handle export report
  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      
      const blob = await ApiService.exportAnalyticsReport(selectedPeriod, 'pdf');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Analytics report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
          {change !== undefined && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: change > 0 ? '#3E8E5A' : change < 0 ? '#DC3545' : '#6B7280',
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
      {error && (
        <div style={{
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          padding: '0.75rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.875rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={headerStyles}>
        <h1 style={titleStyles}>Analytics Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            variant="outline" 
            size="medium"
            onClick={() => fetchAnalyticsData(selectedPeriod)}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : '🔄 Refresh'}
          </Button>
          <Button 
            variant="primary" 
            size="medium"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : '📊 Export Report'}
          </Button>
        </div>
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
            value={analyticsData.patientStats?.totalPatients || 0} 
            change={analyticsData.patientStats?.growth?.totalPatients}
            icon="⚕️" 
          />
          <StatCard 
            title="New Patients" 
            value={analyticsData.patientStats?.newPatients || 0} 
            change={analyticsData.patientStats?.growth?.newPatients}
            icon="👤" 
            color="#F4A261"
          />
          <StatCard 
            title="Active Patients" 
            value={analyticsData.patientStats?.activePatients || 0} 
            change={analyticsData.patientStats?.growth?.activePatients}
            icon="💚" 
          />
          <StatCard 
            title="Recovered Patients" 
            value={analyticsData.patientStats?.recoveredPatients || 0} 
            change={analyticsData.patientStats?.growth?.recoveredPatients}
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
            value={analyticsData.consultationStats?.totalConsultations || 0} 
            change={analyticsData.consultationStats?.growth?.totalConsultations}
            icon="🩺" 
          />
          <StatCard 
            title="Completed" 
            value={analyticsData.consultationStats?.completedConsultations || 0} 
            change={analyticsData.consultationStats?.growth?.completedConsultations}
            icon="✅" 
          />
          <StatCard 
            title="Scheduled" 
            value={analyticsData.consultationStats?.scheduledConsultations || 0} 
            change={analyticsData.consultationStats?.growth?.scheduledConsultations}
            icon="📅" 
            color="#F4A261"
          />
          <StatCard 
            title="Avg Duration (min)" 
            value={analyticsData.consultationStats?.averageDuration || 0} 
            change={analyticsData.consultationStats?.growth?.averageDuration}
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
            value={analyticsData.treatmentStats?.activeTreatments || 0} 
            change={analyticsData.treatmentStats?.growth?.activeTreatments}
            icon="🌿" 
          />
          <StatCard 
            title="Completed Treatments" 
            value={analyticsData.treatmentStats?.completedTreatments || 0} 
            change={analyticsData.treatmentStats?.growth?.completedTreatments}
            icon="🎯" 
          />
          <StatCard 
            title="Success Rate %" 
            value={analyticsData.treatmentStats?.successRate || 0} 
            change={analyticsData.treatmentStats?.growth?.successRate}
            icon="📈" 
            color="#3E8E5A"
          />
          <StatCard 
            title="Avg Duration (days)" 
            value={analyticsData.treatmentStats?.averageTreatmentDuration || 0} 
            change={analyticsData.treatmentStats?.growth?.averageTreatmentDuration}
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
              ₹{(analyticsData.revenueStats?.totalRevenue || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#687076' }}>
              Total Revenue ({selectedPeriod})
            </div>
            <div style={{ fontSize: '0.75rem', color: '#3E8E5A', marginTop: '0.25rem' }}>
              +{analyticsData.revenueStats?.monthlyGrowth || 0}% growth
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2C5F41', marginBottom: '0.25rem' }}>
              ₹{(analyticsData.revenueStats?.averagePerPatient || 0).toLocaleString()}
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
            {(analyticsData.revenueStats?.topTreatments || []).map((treatment, index) => (
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
          
          {(!analyticsData.revenueStats?.topTreatments || analyticsData.revenueStats.topTreatments.length === 0) && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#687076', fontSize: '0.875rem' }}>
              No treatment data available for this period
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsScreen;