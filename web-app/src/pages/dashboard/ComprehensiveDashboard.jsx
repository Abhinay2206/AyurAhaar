import React, { useState, useEffect } from 'react';
import { Card, Button, DashboardSearch } from '../../components';
import { AuthService, DashboardService, PatientService, AppointmentService, MealPlanService } from '../../services';
import PatientManagement from '../patients/PatientManagement';

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
  const handleSearchResultSelect = (result) => {
    if (result.type === 'patient') {
      setActiveTab('patients');
      // You can add logic here to highlight or scroll to the specific patient
    } else if (result.type === 'appointment') {
      setActiveTab('appointments');
      // You can add logic here to highlight or scroll to the specific appointment
    }
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
      // Load dashboard stats and recent activities
      const [statsResponse, activitiesResponse] = await Promise.all([
        DashboardService.getDashboardStats(),
        DashboardService.getRecentActivities()
      ]);

      setDashboardData({
        stats: statsResponse,
        recentActivities: activitiesResponse
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
    padding: '2rem',
    backgroundColor: 'var(--medical-gray-50)',
    minHeight: '100vh',
    fontFamily: 'var(--font-primary)'
  };

  const headerStyles = {
    marginBottom: '2rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, var(--medical-primary), var(--medical-primary-light))',
    borderRadius: 'var(--radius-xl)',
    color: 'var(--medical-white)',
    boxShadow: 'var(--medical-shadow-lg)'
  };

  const welcomeStyles = {
    fontSize: '1.875rem',
    fontWeight: '700',
    marginBottom: '0.5rem'
  };

  const subtitleStyles = {
    fontSize: '1rem',
    opacity: 0.9,
    marginBottom: '1rem'
  };

  const quickStatsStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '0.5rem'
  };

  const tabNavigationStyles = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid var(--medical-gray-200)',
    paddingBottom: '1rem'
  };

  const tabButtonStyles = (isActive) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: 'var(--radius-lg)',
    border: 'none',
    backgroundColor: isActive ? 'var(--medical-primary)' : 'transparent',
    color: isActive ? 'var(--medical-white)' : 'var(--medical-gray-600)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    fontSize: '0.875rem'
  });

  const contentGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem'
  };

  const renderStatCard = (title, value, change, icon, trend) => (
    <Card key={title} medical={true} padding="medium" hover={true} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--medical-primary)', marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)', marginBottom: '0.5rem' }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        color: trend === 'up' ? 'var(--medical-success)' : trend === 'down' ? 'var(--medical-error)' : 'var(--medical-gray-500)',
        fontWeight: '500'
      }}>
        {change}
      </div>
    </Card>
  );

  const renderOverviewTab = () => (
    <div style={contentGridStyles}>
      {/* Today's Schedule */}
      <Card medical={true} padding="large" hover={false}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--medical-gray-800)', fontSize: '1.25rem', fontWeight: '600' }}>
          Today's Schedule
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(dashboardData.recentActivities?.recentAppointments || []).length > 0 ? (
            dashboardData.recentActivities.recentAppointments.map(appointment => (
            <div key={appointment.id} style={{
              padding: '1rem',
              border: '1px solid var(--medical-gray-200)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `4px solid ${appointment.status === 'confirmed' ? 'var(--medical-success)' : 'var(--medical-warning)'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--medical-gray-800)' }}>{appointment.time}</span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
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
              fontSize: '0.875rem'
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
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--medical-gray-800)', fontSize: '1.25rem', fontWeight: '600' }}>
          Recent Patients
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(dashboardData.recentActivities?.recentPatients || []).length > 0 ? (
            dashboardData.recentActivities.recentPatients.map(patient => (
            <div key={patient.id} style={{
              padding: '1rem',
              border: '1px solid var(--medical-gray-200)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--medical-gray-50)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--medical-gray-800)' }}>{patient.name}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>Age {patient.age}</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)', marginBottom: '0.25rem' }}>
                Constitution: {patient.constitution}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                Condition: {patient.condition} • Last visit: {patient.lastVisit}
              </div>
            </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: 'var(--medical-gray-500)',
              fontSize: '0.875rem'
            }}>
              No recent patients
            </div>
          )}
        </div>
        <Button variant="secondary" fullWidth style={{ marginTop: '1rem' }}>
          View All Patients
        </Button>
      </Card>

      {/* Quick Actions */}
      <Card medical={true} padding="large" hover={false}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--medical-gray-800)', fontSize: '1.25rem', fontWeight: '600' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button variant="primary" size="large" fullWidth>
            📅 Schedule New Appointment
          </Button>
          <Button variant="secondary" size="large" fullWidth>
            👤 Add New Patient
          </Button>
          <Button variant="secondary" size="large" fullWidth>
            🤖 Generate AI Meal Plan
          </Button>
          <Button variant="secondary" size="large" fullWidth>
            📊 View Analytics
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card medical={true} padding="large" hover={false}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--medical-gray-800)', fontSize: '1.25rem', fontWeight: '600' }}>
          Recent Notifications
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(dashboardData.notifications || []).length > 0 ? (
            dashboardData.notifications.map(notification => (
              <div key={notification.id} style={{
                padding: '0.75rem',
                border: '1px solid var(--medical-gray-200)',
                borderRadius: 'var(--radius-md)',
                borderLeft: `4px solid ${notification.urgent ? 'var(--medical-error)' : 'var(--medical-primary)'}`
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>{notification.message}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--medical-gray-500)' }}>{notification.time}</div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: 'var(--medical-gray-500)',
              fontSize: '0.875rem'
            }}>
              No recent notifications
            </div>
          )}
        </div>
        <Button variant="secondary" fullWidth style={{ marginTop: '1rem' }}>
          View All Notifications
        </Button>
      </Card>
    </div>
  );

  const renderMealPlansTab = () => (
    <Card medical={true} padding="large" hover={false}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--medical-gray-800)', fontSize: '1.25rem', fontWeight: '600' }}>
          Meal Plan Management
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary">🤖 Generate AI Plan</Button>
          <Button variant="primary">➕ Create Custom Plan</Button>
        </div>
      </div>

      {/* Plan Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: 'var(--medical-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--medical-primary)' }}>45</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>Active Plans</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--medical-success-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--medical-success)' }}>23</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>AI Generated</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--medical-warning-light)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--medical-warning)' }}>5</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>Pending Approval</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'var(--medical-gray-100)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--medical-gray-600)' }}>87%</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>Success Rate</div>
        </div>
      </div>

      {/* Recent Plans */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(dashboardData.recentActivities?.recentMealPlans || []).length > 0 ? (
          dashboardData.recentActivities.recentMealPlans.map(plan => (
          <div key={plan.id} style={{
            padding: '1.5rem',
            border: '1px solid var(--medical-gray-200)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all var(--transition-base)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{plan.patient}</h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--medical-gray-600)' }}>
                  {plan.planType} Plan • Created {plan.created}
                </div>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: plan.status === 'active' ? 'var(--medical-success-light)' : 'var(--medical-warning-light)',
                color: plan.status === 'active' ? 'var(--medical-success-dark)' : 'var(--medical-warning-dark)'
              }}>
                {plan.status}
              </span>
            </div>
            
            {plan.status === 'active' && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>Progress</span>
                  <span>{plan.progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--medical-gray-200)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${plan.progress}%`,
                    height: '100%',
                    backgroundColor: 'var(--medical-success)',
                    transition: 'width var(--transition-base)'
                  }}></div>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="small">View Details</Button>
              <Button variant="primary" size="small">Edit Plan</Button>
              {plan.status === 'pending approval' && (
                <Button variant="success" size="small">Approve</Button>
              )}
            </div>
          </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: 'var(--medical-gray-500)',
            fontSize: '0.875rem'
          }}>
            No recent meal plans
          </div>
        )}
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔄</div>
          <div>Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={welcomeStyles}>
          Welcome back, {doctor?.name || 'Doctor'}! 👋
        </div>
        <div style={subtitleStyles}>
          Here's what's happening with your practice today
        </div>
        
        {/* Quick Stats */}
        <div style={quickStatsStyles}>
          {renderStatCard('Total Patients', dashboardData.stats.totalPatients, `${dashboardData.stats.totalPatients > 0 ? 'Assigned to you' : 'No patients yet'}`, '👥', 'neutral')}
          {renderStatCard('Today\'s Appointments', dashboardData.stats.todayAppointments, `${dashboardData.stats.todayAppointments > 0 ? 'scheduled' : 'No appointments'}`, '📅', 'neutral')}
          {renderStatCard('Active Meal Plans', dashboardData.stats.activeMealPlans, `${dashboardData.stats.activeMealPlans > 0 ? 'in progress' : 'Create new plans'}`, '🍽️', 'up')}
          {renderStatCard('Pending Appointments', dashboardData.stats.pendingAppointments, `${dashboardData.stats.pendingAppointments > 0 ? 'need attention' : 'All up to date'}`, '⚕️', 'neutral')}
        </div>

        {/* Dashboard Search */}
        <div style={{ marginTop: '1.5rem' }}>
          <DashboardSearch onResultSelect={handleSearchResultSelect} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={tabNavigationStyles}>
        <button 
          style={tabButtonStyles(activeTab === 'overview')}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          style={tabButtonStyles(activeTab === 'patients')}
          onClick={() => setActiveTab('patients')}
        >
          👥 Patients
        </button>
        <button 
          style={tabButtonStyles(activeTab === 'appointments')}
          onClick={() => setActiveTab('appointments')}
        >
          📅 Appointments
        </button>
        <button 
          style={tabButtonStyles(activeTab === 'mealplans')}
          onClick={() => setActiveTab('mealplans')}
        >
          🍽️ Meal Plans
        </button>
        <button 
          style={tabButtonStyles(activeTab === 'analytics')}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'patients' && <PatientManagement />}
      {activeTab === 'mealplans' && renderMealPlansTab()}
      {activeTab === 'appointments' && (
        <Card medical={true} padding="large">
          <h3>Appointment Management</h3>
          <p>Appointment management interface coming soon...</p>
        </Card>
      )}
      {activeTab === 'analytics' && (
        <Card medical={true} padding="large">
          <h3>Analytics & Reports</h3>
          <p>Analytics dashboard coming soon...</p>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveDashboard;