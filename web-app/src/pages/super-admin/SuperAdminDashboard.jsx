import React, { useState } from 'react';
import { Card, Button } from '../../components';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats] = useState({
    totalDoctors: 45,
    activeDoctors: 38,
    totalPatients: 1247,
    activePatients: 892,
    totalFoodItems: 882,
    verifiedFoodItems: 743,
    totalPlans: 156,
    activePlans: 134,
    revenueThisMonth: 125000,
    revenueLastMonth: 98000
  });

  const [recentActivities] = useState([
    { id: 1, type: 'doctor', action: 'New doctor registered', doctor: 'Dr. Priya Sharma', time: '2 hours ago' },
    { id: 2, type: 'patient', action: 'Patient consultation completed', patient: 'Rajesh Kumar', time: '4 hours ago' },
    { id: 3, type: 'food', action: 'Food item verified', item: 'Organic Quinoa', time: '6 hours ago' },
    { id: 4, type: 'plan', action: 'Meal plan created', doctor: 'Dr. Amit Patel', time: '8 hours ago' },
    { id: 5, type: 'system', action: 'Database backup completed', time: '12 hours ago' }
  ]);

  const [systemHealth] = useState({
    apiStatus: 'healthy',
    databaseStatus: 'healthy',
    serverLoad: '45%',
    uptime: '99.8%',
    activeUsers: 124
  });

  const getActivityIcon = (type) => {
    const icons = {
      doctor: '👨‍⚕️',
      patient: '👤',
      food: '🥗',
      plan: '📋',
      system: '⚙️'
    };
    return icons[type] || '📌';
  };

  const getStatusColor = (status) => {
    return status === 'healthy' ? '#22c55e' : '#ef4444';
  };

  return (
    <div className="super-admin-dashboard">
      <div className="page-header">
        <div className="header-content">
          <h1>🏛️ Super Admin Dashboard</h1>
          <p>Complete system overview and management controls</p>
        </div>
        <div className="header-actions">
          <Button variant="outline">📊 Generate Report</Button>
          <Button variant="primary">⚙️ System Settings</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <Card className="metric-card doctors">
          <div className="metric-header">
            <span className="metric-icon">👨‍⚕️</span>
            <div className="metric-info">
              <h3>Doctors</h3>
              <div className="metric-value">{stats.totalDoctors}</div>
              <div className="metric-subtitle">{stats.activeDoctors} active</div>
            </div>
          </div>
          <div className="metric-trend positive">+5 this month</div>
        </Card>

        <Card className="metric-card patients">
          <div className="metric-header">
            <span className="metric-icon">👥</span>
            <div className="metric-info">
              <h3>Patients</h3>
              <div className="metric-value">{stats.totalPatients.toLocaleString()}</div>
              <div className="metric-subtitle">{stats.activePatients} active</div>
            </div>
          </div>
          <div className="metric-trend positive">+127 this month</div>
        </Card>

        <Card className="metric-card food-items">
          <div className="metric-header">
            <span className="metric-icon">🥗</span>
            <div className="metric-info">
              <h3>Food Items</h3>
              <div className="metric-value">{stats.totalFoodItems}</div>
              <div className="metric-subtitle">{stats.verifiedFoodItems} verified</div>
            </div>
          </div>
          <div className="metric-trend neutral">Pending: {stats.totalFoodItems - stats.verifiedFoodItems}</div>
        </Card>

        <Card className="metric-card plans">
          <div className="metric-header">
            <span className="metric-icon">📋</span>
            <div className="metric-info">
              <h3>Meal Plans</h3>
              <div className="metric-value">{stats.totalPlans}</div>
              <div className="metric-subtitle">{stats.activePlans} active</div>
            </div>
          </div>
          <div className="metric-trend positive">+23 this week</div>
        </Card>
      </div>

      {/* Revenue Overview */}
      <div className="dashboard-row">
        <Card className="revenue-card">
          <h3>📈 Revenue Overview</h3>
          <div className="revenue-stats">
            <div className="revenue-item">
              <span className="revenue-label">This Month</span>
              <span className="revenue-value">₹{stats.revenueThisMonth.toLocaleString()}</span>
              <span className="revenue-change positive">
                +{Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)}%
              </span>
            </div>
            <div className="revenue-item">
              <span className="revenue-label">Last Month</span>
              <span className="revenue-value">₹{stats.revenueLastMonth.toLocaleString()}</span>
            </div>
          </div>
          <div className="revenue-chart-placeholder">
            <div className="chart-bars">
              {[65, 78, 85, 92, 88, 95, 100].map((height, index) => (
                <div 
                  key={index} 
                  className="chart-bar" 
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="system-health-card">
          <h3>⚡ System Health</h3>
          <div className="health-metrics">
            <div className="health-item">
              <span className="health-label">API Status</span>
              <span className="health-status" style={{color: getStatusColor(systemHealth.apiStatus)}}>
                ● {systemHealth.apiStatus}
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">Database</span>
              <span className="health-status" style={{color: getStatusColor(systemHealth.databaseStatus)}}>
                ● {systemHealth.databaseStatus}
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">Server Load</span>
              <span className="health-value">{systemHealth.serverLoad}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Uptime</span>
              <span className="health-value">{systemHealth.uptime}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Active Users</span>
              <span className="health-value">{systemHealth.activeUsers}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="activities-card">
        <div className="activities-header">
          <h3>📋 Recent Activities</h3>
          <Button variant="outline" size="small">View All</Button>
        </div>
        <div className="activities-list">
          {recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <span className="activity-icon">{getActivityIcon(activity.type)}</span>
              <div className="activity-content">
                <div className="activity-action">{activity.action}</div>
                <div className="activity-details">
                  {activity.doctor && <span>by {activity.doctor}</span>}
                  {activity.patient && <span>for {activity.patient}</span>}
                  {activity.item && <span>{activity.item}</span>}
                </div>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="quick-actions-card">
        <h3>⚡ Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn doctors">
            <span className="action-icon">👨‍⚕️</span>
            <span className="action-title">Manage Doctors</span>
            <span className="action-desc">Add, edit, verify doctors</span>
          </button>
          <button className="quick-action-btn patients">
            <span className="action-icon">👥</span>
            <span className="action-title">View Patients</span>
            <span className="action-desc">Patient records & analytics</span>
          </button>
          <button className="quick-action-btn food">
            <span className="action-icon">🥗</span>
            <span className="action-title">Food Database</span>
            <span className="action-desc">Manage food items & properties</span>
          </button>
          <button className="quick-action-btn plans">
            <span className="action-icon">📋</span>
            <span className="action-title">Meal Plans</span>
            <span className="action-desc">Review & approve plans</span>
          </button>
          <button className="quick-action-btn reports">
            <span className="action-icon">📊</span>
            <span className="action-title">Analytics</span>
            <span className="action-desc">Reports & insights</span>
          </button>
          <button className="quick-action-btn settings">
            <span className="action-icon">⚙️</span>
            <span className="action-title">System Settings</span>
            <span className="action-desc">Configuration & preferences</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
