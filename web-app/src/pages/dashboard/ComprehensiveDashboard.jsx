import React, { useState, useEffect } from 'react';
import { Card, Button, DashboardSearch } from '../../components';
import { AuthService, DashboardService, PatientService, AppointmentService, MealPlanService } from '../../services';

const ComprehensiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctor, setDoctor] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 0,
      todayAppointments: 0,
      pendingAppointments: 0,
      activeMealPlans: 0
    },
    recentActivities: {
      recentPatients: [],
      recentAppointments: [],
      recentMealPlans: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);

  // Search result handling
  const handleSearchResultSelect = () => {
    // Only overview tab available now
    setActiveTab('overview');
  };

  useEffect(() => {
    const user = AuthService.getUser();
    setDoctor(user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Dashboard: Loading dashboard data...');
      console.log('🔑 Dashboard: Current user:', AuthService.getUser());
      console.log('🎫 Dashboard: Current token:', AuthService.getToken() ? 'Present' : 'Missing');
      
      // Load dashboard stats and recent activities
      const [statsResponse, activitiesResponse] = await Promise.all([
        DashboardService.getDashboardStats(),
        DashboardService.getRecentActivities()
      ]);

      console.log('📊 Dashboard: Stats response:', statsResponse);
      console.log('📋 Dashboard: Activities response:', activitiesResponse);

      setDashboardData({
        stats: statsResponse,
        recentActivities: activitiesResponse
      });
    } catch (error) {
      console.error('❌ Dashboard: Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      // Fallback to mock data if API fails
      setDashboardData({
        stats: {
          totalPatients: 0,
          todayAppointments: 0,
          pendingAppointments: 0,
          activeMealPlans: 0
        },
        recentActivities: {
          recentPatients: [],
          recentAppointments: [],
          recentMealPlans: []
        }
      });
    } finally {
      setIsLoading(false);
    }
  };


  const containerStyles = {
    padding: '0.75rem', // Reduced from 2rem
    backgroundColor: '#F5F7FA', // Clean background
    minHeight: '100vh',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyles = {
    marginBottom: '1rem', // Reduced from 2rem
    padding: '1.25rem', // Reduced from 2rem
    background: 'linear-gradient(135deg, #3E8E5A 0%, #4A9D6A 100%)', // Herbal green gradient
    borderRadius: '12px', // Reduced from 16px
    color: 'white',
    boxShadow: '0 10px 30px rgba(62, 142, 90, 0.2)',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const welcomeStyles = {
    fontSize: '1.5rem', // Reduced from 1.875rem
    fontWeight: '700',
    marginBottom: '0.25rem', // Reduced from 0.5rem
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const subtitleStyles = {
    fontSize: '0.9rem', // Reduced from 1rem
    opacity: 0.9,
    marginBottom: '0.75rem', // Reduced from 1rem
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const quickStatsStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', // Reduced min-width from 200px
    gap: '0.75rem', // Reduced from 1rem
    marginBottom: '0.25rem' // Reduced from 0.5rem
  };

  const tabNavigationStyles = {
    display: 'flex',
    gap: '0.25rem', // Reduced from 0.5rem
    marginBottom: '1rem', // Reduced from 2rem
    borderBottom: '2px solid #E0E0E0', // Input border color
    paddingBottom: '0.5rem' // Reduced from 1rem
  };

  const tabButtonStyles = (isActive) => ({
    padding: '0.5rem 1rem', // Reduced from 0.75rem 1.5rem
    borderRadius: '8px', // Reduced from 12px
    border: 'none',
    backgroundColor: isActive ? '#3E8E5A' : 'transparent', // Herbal green for active
    color: isActive ? 'white' : '#687076', // Icon color for inactive
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.8rem', // Reduced from 0.875rem
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    ':hover': {
      backgroundColor: isActive ? '#3E8E5A' : 'rgba(62, 142, 90, 0.1)',
    }
  });

  const contentGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Reduced from 350px
    gap: '1rem' // Reduced from 2rem
  };

  const renderStatCard = (title, value, change, icon, trend) => (
    <Card 
      key={title} 
      medical={true} 
      padding="medium" 
      hover={true} 
      style={{ 
        textAlign: 'center',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%)', // Card background
        border: '1px solid #E0E0E0',
        borderRadius: '12px', // Reduced from 16px
        boxShadow: '0 4px 20px rgba(62, 142, 90, 0.08)', // Herbal green shadow
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.25rem', filter: 'brightness(1.1)' }}>{icon}</div>
      <div style={{ 
        fontSize: '1.75rem', // Reduced from 2rem
        fontWeight: '700', 
        color: '#3E8E5A', // Herbal green
        marginBottom: '0.125rem', // Reduced from 0.25rem
        fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '0.8rem', // Reduced from 0.875rem
        color: '#2C5F41', // Section header color
        marginBottom: '0.25rem', // Reduced from 0.5rem
        fontWeight: '600',
        fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '0.7rem', // Reduced from 0.75rem
        color: trend === 'up' ? '#3E8E5A' : trend === 'down' ? '#DC3545' : '#687076', // Success, error, or icon color
        fontWeight: '500',
        fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        {change}
      </div>
    </Card>
  );

  const renderOverviewTab = () => (
    <div style={contentGridStyles}>
      {/* Today's Schedule */}
      <Card medical={true} padding="large" hover={false}>
        <h3 style={{ 
          marginBottom: '0.75rem', 
          color: 'var(--medical-gray-800)', 
          fontSize: '1.1rem', 
          fontWeight: '600',
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Today's Schedule
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(dashboardData.recentActivities?.recentAppointments || []).length > 0 ? (
            dashboardData.recentActivities.recentAppointments.map(appointment => (
            <div key={appointment.id} style={{
              padding: '0.75rem',
              border: '1px solid var(--medical-gray-200)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${appointment.status === 'confirmed' ? 'var(--medical-success)' : 'var(--medical-warning)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--medical-gray-800)' }}>{appointment.time}</span>
                <span style={{
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.7rem',
                  fontWeight: '500',
                  backgroundColor: appointment.status === 'confirmed' ? 'var(--medical-success-light)' : 'var(--medical-warning-light)',
                  color: appointment.status === 'confirmed' ? 'var(--medical-success-dark)' : 'var(--medical-warning-dark)'
                }}>
                  {appointment.status}
                </span>
              </div>
              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{appointment.patient}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                {appointment.type} • {appointment.duration}
              </div>
            </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: 'var(--medical-gray-500)',
              fontSize: '0.875rem',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              No appointments today
            </div>
          )}
        </div>
        <Button variant="secondary" fullWidth style={{ marginTop: '1rem' }}>
          View Full Schedule
        </Button>
      </Card>

      {/* Recent Patients */}
      <Card medical={true} padding="large" hover={false}>
        <h3 style={{ 
          marginBottom: '0.75rem', 
          color: 'var(--medical-gray-800)', 
          fontSize: '1.1rem', 
          fontWeight: '600',
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          Recent Patients
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(dashboardData.recentActivities?.recentPatients || []).length > 0 ? (
            dashboardData.recentActivities.recentPatients.map(patient => (
            <div key={patient.id} style={{
              padding: '0.75rem',
              border: '1px solid var(--medical-gray-200)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--medical-gray-50)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ 
                  fontWeight: '600', 
                  color: 'var(--medical-gray-800)',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>{patient.name}</span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--medical-gray-600)',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>Age {patient.age}</span>
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--medical-gray-600)', 
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Constitution: {patient.constitution}
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: 'var(--medical-gray-600)',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Condition: {patient.condition} • Last visit: {patient.lastVisit}
              </div>
            </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: 'var(--medical-gray-500)',
              fontSize: '0.875rem',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              No recent patients
            </div>
          )}
        </div>
        <Button variant="secondary" fullWidth style={{ marginTop: '0.5rem' }}>
          View All Patients
        </Button>
      </Card>

      {/* Quick Actions */}
      <Card medical={true} padding="large" hover={false}>
        <h3 style={{ marginBottom: '0.75rem', color: 'var(--medical-gray-800)', fontSize: '1.1rem', fontWeight: '600', fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Button variant="primary" size="medium" fullWidth>
            ⏰ Schedule New Appointment
          </Button>
          <Button variant="secondary" size="medium" fullWidth>
            + Add New Patient
          </Button>
          <Button variant="secondary" size="medium" fullWidth>
            ■ View Analytics
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card medical={true} padding="large" hover={false}>
        <h3 style={{ marginBottom: '0.75rem', color: 'var(--medical-gray-800)', fontSize: '1.1rem', fontWeight: '600' }}>
          Recent Notifications
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(dashboardData.notifications || []).length > 0 ? (
            dashboardData.notifications.map(notification => (
              <div key={notification.id} style={{
                padding: '0.5rem',
                border: '1px solid var(--medical-gray-200)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${notification.urgent ? 'var(--medical-error)' : 'var(--medical-primary)'}`
              }}>
                <div style={{ 
                  fontSize: '0.8rem', 
                  marginBottom: '0.125rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>{notification.message}</div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--medical-gray-500)',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>{notification.time}</div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem', 
              color: 'var(--medical-gray-500)',
              fontSize: '0.8rem',
              fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              No recent notifications
            </div>
          )}
        </div>
        <Button variant="secondary" fullWidth style={{ marginTop: '0.5rem' }}>
          View All Notifications
        </Button>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⟳</div>
          <div style={{ 
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={welcomeStyles}>
          Welcome back, {doctor?.name || 'Doctor'}!
        </div>
        <div style={subtitleStyles}>
          Here's what's happening with your practice today
        </div>
        
        {/* Quick Stats */}
        <div style={quickStatsStyles}>
          {renderStatCard('Total Patients', dashboardData.stats.totalPatients, `${dashboardData.stats.totalPatients > 0 ? 'Assigned to you' : 'No patients yet'}`, '⚕', 'neutral')}
          {renderStatCard('Today\'s Appointments', dashboardData.stats.todayAppointments, `${dashboardData.stats.todayAppointments > 0 ? 'scheduled' : 'No appointments'}`, '⏰', 'neutral')}
          {renderStatCard('Active Meal Plans', dashboardData.stats.activeMealPlans, `${dashboardData.stats.activeMealPlans > 0 ? 'in progress' : 'Create new plans'}`, '🗂', 'up')}
          {renderStatCard('Pending Appointments', dashboardData.stats.pendingAppointments, `${dashboardData.stats.pendingAppointments > 0 ? 'need attention' : 'All up to date'}`, '⚕️', 'neutral')}
        </div>

        {/* Dashboard Search */}
        <div style={{ marginTop: '0.75rem' }}>
          <DashboardSearch onResultSelect={handleSearchResultSelect} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={tabNavigationStyles}>
        <button 
          style={tabButtonStyles(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          ■ Overview
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
    </div>
  );
};

export default ComprehensiveDashboard;