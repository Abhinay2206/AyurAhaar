import React, { useState } from 'react';
import { Card, Button } from '../../components';

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

  // Professional styling consistent with doctor portal
  const containerStyles = {
    padding: '1rem',
    backgroundColor: '#F8F9FA',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const headerStyles = {
    padding: '1.5rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #3E8E5A 0%, #4A9D6A 100%)',
    boxShadow: '0 4px 20px rgba(62, 142, 90, 0.2)'
  };

  const titleStyles = {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const subtitleStyles = {
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    fontWeight: '400',
    fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const metricsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const getActivityIcon = (type) => {
    const icons = {
      doctor: '⚕',
      patient: '●',
      food: '■',
      plan: '◉',
      system: '⚙'
    };
    return icons[type] || '▪';
  };

  const getStatusColor = (status) => {
    return status === 'healthy' ? '#22c55e' : '#ef4444';
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={titleStyles}>
              <span>⚡</span>
              Super Admin Dashboard
            </h1>
            <p style={subtitleStyles}>
              Complete system overview and management controls
            </p>
          </div>
          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <Button variant="outline" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span>■</span> Generate Report
            </Button>
            <Button variant="primary" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span>⚙</span> System Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={metricsGridStyles}>
        <Card style={{
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontSize: '2rem',
              filter: 'brightness(1.1)',
              color: '#3E8E5A'
            }}>
              ⚕
            </span>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C5F41',
                margin: 0,
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Doctors
              </h3>
              <div style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#374151',
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.totalDoctors}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#687076',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.activeDoctors} active
              </div>
            </div>
          </div>
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#D1FAE5',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#065F46',
            fontWeight: '500',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            +5 this month
          </div>
        </Card>

        <Card style={{
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontSize: '2rem',
              filter: 'brightness(1.1)',
              color: '#3E8E5A'
            }}>
              ●
            </span>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C5F41',
                margin: 0,
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Patients
              </h3>
              <div style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#374151',
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.totalPatients.toLocaleString()}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#687076',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.activePatients} active
              </div>
            </div>
          </div>
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#D1FAE5',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#065F46',
            fontWeight: '500',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            +127 this month
          </div>
        </Card>

        <Card style={{
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontSize: '2rem',
              filter: 'brightness(1.1)',
              color: '#3E8E5A'
            }}>
              ■
            </span>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C5F41',
                margin: 0,
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Food Items
              </h3>
              <div style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#374151',
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.totalFoodItems}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#687076',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.verifiedFoodItems} verified
              </div>
            </div>
          </div>
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#FEF3C7',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#92400E',
            fontWeight: '500',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            Pending: {stats.totalFoodItems - stats.verifiedFoodItems}
          </div>
        </Card>

        <Card style={{
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontSize: '2rem',
              filter: 'brightness(1.1)',
              color: '#3E8E5A'
            }}>
              ◉
            </span>
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#2C5F41',
                margin: 0,
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Meal Plans
              </h3>
              <div style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#374151',
                marginBottom: '0.25rem',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.totalPlans}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#687076',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {stats.activePlans} active
              </div>
            </div>
          </div>
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#DBEAFE',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#1E40AF',
            fontWeight: '500',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            +23 this week
          </div>
        </Card>
      </div>

      {/* Revenue and System Health Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <Card style={{
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          backgroundColor: '#ffffff'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2C5F41',
            marginBottom: '1rem',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>▲</span> Revenue Overview
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#687076',
                  marginBottom: '0.25rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  This Month
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: '#374151',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  ₹{stats.revenueThisMonth.toLocaleString()}
                </div>
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#22c55e',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#D1FAE5',
                borderRadius: '4px',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                +{Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)}%
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#687076',
                  marginBottom: '0.25rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  Last Month
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  ₹{stats.revenueLastMonth.toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{
              height: '80px',
              display: 'flex',
              alignItems: 'end',
              gap: '4px',
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              {[65, 78, 85, 92, 88, 95, 100].map((height, index) => (
                <div 
                  key={index}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    backgroundColor: '#3E8E5A',
                    borderRadius: '2px',
                    opacity: 0.8
                  }}
                ></div>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB',
          backgroundColor: '#ffffff'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2C5F41',
            marginBottom: '1rem',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>●</span> System Health
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                API Status
              </span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: getStatusColor(systemHealth.apiStatus),
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                ● {systemHealth.apiStatus}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Database
              </span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: getStatusColor(systemHealth.databaseStatus),
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                ● {systemHealth.databaseStatus}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Server Load
              </span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {systemHealth.serverLoad}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Uptime
              </span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#22c55e',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {systemHealth.uptime}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                Active Users
              </span>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              }}>
                {systemHealth.activeUsers}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card style={{
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB',
        backgroundColor: '#ffffff',
        marginBottom: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2C5F41',
            margin: 0,
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>■</span> Recent Activities
          </h3>
          <Button variant="outline" style={{
            fontSize: '0.875rem',
            padding: '0.5rem 1rem'
          }}>
            View All
          </Button>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {recentActivities.map(activity => (
            <div key={activity.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid #F3F4F6'
            }}>
              <span style={{
                fontSize: '1.5rem',
                color: '#3E8E5A',
                minWidth: '2rem',
                textAlign: 'center'
              }}>
                {getActivityIcon(activity.type)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.25rem',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {activity.action}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#687076',
                  fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                }}>
                  {activity.doctor && <span>by {activity.doctor}</span>}
                  {activity.patient && <span>for {activity.patient}</span>}
                  {activity.item && <span>{activity.item}</span>}
                </div>
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#9CA3AF',
                fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                minWidth: 'fit-content'
              }}>
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card style={{
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #E5E7EB',
        backgroundColor: '#ffffff'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#2C5F41',
          marginBottom: '1rem',
          fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>▲</span> Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.borderColor = '#3E8E5A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
          }}>
            <span style={{ fontSize: '2rem', color: '#3E8E5A' }}>⚕</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                Manage Doctors
              </div>
              <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                Add, edit, verify doctors
              </div>
            </div>
          </button>
          
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.borderColor = '#3E8E5A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
          }}>
            <span style={{ fontSize: '2rem', color: '#3E8E5A' }}>●</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                View Patients
              </div>
              <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                Patient records & analytics
              </div>
            </div>
          </button>
          
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.borderColor = '#3E8E5A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
          }}>
            <span style={{ fontSize: '2rem', color: '#3E8E5A' }}>■</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                Food Database
              </div>
              <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                Manage food items & properties
              </div>
            </div>
          </button>
          
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.borderColor = '#3E8E5A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
          }}>
            <span style={{ fontSize: '2rem', color: '#3E8E5A' }}>◉</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                Meal Plans
              </div>
              <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                Review & approve plans
              </div>
            </div>
          </button>
          
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.borderColor = '#3E8E5A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
          }}>
            <span style={{ fontSize: '2rem', color: '#3E8E5A' }}>▲</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                Analytics
              </div>
              <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                Reports & insights
              </div>
            </div>
          </button>
          
          <button style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.5rem',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', 'Open Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#F3F4F6';
            e.target.style.borderColor = '#3E8E5A';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#F9FAFB';
            e.target.style.borderColor = '#E5E7EB';
          }}>
            <span style={{ fontSize: '2rem', color: '#3E8E5A' }}>⚙</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                System Settings
              </div>
              <div style={{ fontSize: '0.875rem', color: '#687076' }}>
                Configuration & preferences
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
