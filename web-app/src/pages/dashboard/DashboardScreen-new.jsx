import React from 'react';

const DashboardScreen = () => {
  // Mock data for clinical dashboard
  const doctorData = {
    name: "Dr. Rajesh Kumar",
    specialization: "Ayurvedic Physician",
    license: "AYU-MH-2019-12345",
    experience: "8 years",
    department: "Panchakarma & General Medicine"
  };

  const todayStats = {
    totalPatients: { value: 248, change: '+12 this month', status: 'up', icon: '👥' },
    todayAppointments: { value: 18, change: '3 pending', status: 'neutral', icon: '📅' },
    activeTreatments: { value: 47, change: '12 new this week', status: 'up', icon: '🍽️' },
    revenue: { value: '₹1,24,500', change: '+18% this month', status: 'up', icon: '💰' },
  };

  const upcomingAppointments = [
    { 
      id: 1, 
      time: '10:30 AM', 
      patient: 'Mrs. Priya Sharma', 
      age: 34,
      type: 'Follow-up', 
      condition: 'Digestive Disorders',
      duration: '30 min',
      status: 'confirmed',
      priority: 'normal'
    },
    { 
      id: 2, 
      time: '11:15 AM', 
      patient: 'Mr. Amit Patel', 
      age: 42,
      type: 'Consultation', 
      condition: 'Joint Pain & Arthritis',
      duration: '45 min',
      status: 'confirmed',
      priority: 'high'
    },
    { 
      id: 3, 
      time: '2:00 PM', 
      patient: 'Mrs. Sunita Devi', 
      age: 28,
      type: 'Check-up', 
      condition: 'Skin Disorders',
      duration: '30 min',
      status: 'pending',
      priority: 'normal'
    },
  ];

  const recentActivities = [
    { 
      id: 1, 
      action: 'Prescription updated for Rahul Verma', 
      time: '15 min ago', 
      type: 'prescription',
      icon: '💊'
    },
    { 
      id: 2, 
      action: 'Lab results received for Meera Singh', 
      time: '45 min ago', 
      type: 'lab',
      icon: '📋'
    },
    { 
      id: 3, 
      action: 'Treatment plan created for Vikash Kumar', 
      time: '1 hour ago', 
      type: 'treatment',
      icon: '🍽️'
    },
    { 
      id: 4, 
      action: 'Appointment scheduled with Anjali Gupta', 
      time: '2 hours ago', 
      type: 'appointment',
      icon: '📅'
    },
  ];

  const styles = {
    container: {
      background: 'var(--bg-gradient-primary)',
      minHeight: '100vh',
      padding: 'var(--space-6)',
    },
    
    header: {
      marginBottom: 'var(--space-8)',
    },
    
    welcome: {
      fontSize: 'var(--text-3xl)',
      fontWeight: '700',
      color: 'var(--gray-900)',
      marginBottom: 'var(--space-2)',
      fontFamily: 'var(--font-display)',
    },
    
    subtitle: {
      fontSize: 'var(--text-lg)',
      color: 'var(--gray-600)',
      fontWeight: '400',
    },
    
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'var(--space-6)',
      marginBottom: 'var(--space-8)',
    },
    
    statCard: {
      background: 'var(--bg-gradient-card)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-6)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'var(--transition-base)',
      boxShadow: 'var(--shadow-sm)',
    },
    
    statCardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-4)',
    },
    
    statIcon: {
      fontSize: '24px',
      padding: 'var(--space-3)',
      backgroundColor: 'var(--primary-50)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--primary-200)',
    },
    
    statValue: {
      fontSize: 'var(--text-3xl)',
      fontWeight: '800',
      color: 'var(--gray-900)',
      lineHeight: 1,
      marginBottom: 'var(--space-2)',
    },
    
    statChange: {
      fontSize: 'var(--text-sm)',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
    },
    
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: 'var(--space-8)',
    },
    
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
    },
    
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
    },
    
    card: {
      background: 'var(--bg-gradient-card)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-2xl)',
      padding: 'var(--space-6)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'var(--transition-base)',
    },
    
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-6)',
      paddingBottom: 'var(--space-4)',
      borderBottom: '1px solid var(--gray-100)',
    },
    
    cardTitle: {
      fontSize: 'var(--text-xl)',
      fontWeight: '700',
      color: 'var(--gray-900)',
    },
    
    appointmentItem: {
      display: 'flex',
      gap: 'var(--space-4)',
      padding: 'var(--space-4)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--gray-100)',
      backgroundColor: 'var(--gray-25)',
      marginBottom: 'var(--space-3)',
      transition: 'var(--transition-fast)',
    },
    
    timeSlot: {
      minWidth: '80px',
      textAlign: 'center',
      padding: 'var(--space-2)',
      backgroundColor: 'var(--primary-50)',
      border: '1px solid var(--primary-200)',
      borderRadius: 'var(--radius-lg)',
      color: 'var(--primary-700)',
      fontSize: 'var(--text-sm)',
      fontWeight: '600',
    },
    
    appointmentDetails: {
      flex: 1,
    },
    
    patientName: {
      fontSize: 'var(--text-lg)',
      fontWeight: '600',
      color: 'var(--gray-900)',
      marginBottom: 'var(--space-1)',
    },
    
    appointmentMeta: {
      fontSize: 'var(--text-sm)',
      color: 'var(--gray-600)',
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap',
    },
    
    statusBadge: {
      padding: 'var(--space-1) var(--space-2)',
      borderRadius: 'var(--radius-lg)',
      fontSize: 'var(--text-xs)',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
    },
    
    activityItem: {
      display: 'flex',
      gap: 'var(--space-3)',
      padding: 'var(--space-3)',
      borderRadius: 'var(--radius-lg)',
      transition: 'var(--transition-fast)',
      marginBottom: 'var(--space-2)',
    },
    
    activityIcon: {
      width: '36px',
      height: '36px',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--gray-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
    },
    
    activityContent: {
      flex: 1,
    },
    
    activityText: {
      fontSize: 'var(--text-sm)',
      color: 'var(--gray-800)',
      marginBottom: 'var(--space-1)',
    },
    
    activityTime: {
      fontSize: 'var(--text-xs)',
      color: 'var(--gray-500)',
    },
    
    quickActions: {
      display: 'flex',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-4)',
    },
    
    actionButton: {
      flex: 1,
      padding: 'var(--space-3) var(--space-4)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--primary-200)',
      backgroundColor: 'var(--primary-50)',
      color: 'var(--primary-700)',
      fontSize: 'var(--text-sm)',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'var(--transition-fast)',
      textAlign: 'center',
    },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: 'var(--success-50)', color: 'var(--success-700)' };
      case 'pending':
        return { backgroundColor: 'var(--warning-50)', color: 'var(--warning-700)' };
      case 'cancelled':
        return { backgroundColor: 'var(--error-50)', color: 'var(--error-700)' };
      default:
        return { backgroundColor: 'var(--gray-50)', color: 'var(--gray-700)' };
    }
  };

  const getChangeColor = (status) => {
    switch (status) {
      case 'up':
        return 'var(--success-600)';
      case 'down':
        return 'var(--error-600)';
      default:
        return 'var(--gray-600)';
    }
  };

  const getChangeIcon = (status) => {
    switch (status) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.welcome}>Good morning, {doctorData.name}</h1>
        <p style={styles.subtitle}>
          Here's your clinical overview for today • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {Object.entries(todayStats).map(([key, stat]) => (
          <div 
            key={key} 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={styles.statCardHeader}>
              <div style={styles.statIcon}>{stat.icon}</div>
            </div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={{...styles.statChange, color: getChangeColor(stat.status)}}>
              <span>{getChangeIcon(stat.status)}</span>
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Upcoming Appointments */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Today's Appointments</h2>
              <button style={{...styles.actionButton, flex: 'none', width: 'auto'}}>
                View All
              </button>
            </div>
            
            {upcomingAppointments.map(appointment => (
              <div 
                key={appointment.id} 
                style={styles.appointmentItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-25)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={styles.timeSlot}>{appointment.time}</div>
                <div style={styles.appointmentDetails}>
                  <div style={styles.patientName}>{appointment.patient}</div>
                  <div style={styles.appointmentMeta}>
                    <span>{appointment.type}</span>
                    <span>•</span>
                    <span>{appointment.condition}</span>
                    <span>•</span>
                    <span>{appointment.duration}</span>
                  </div>
                </div>
                <div 
                  style={{...styles.statusBadge, ...getStatusColor(appointment.status)}}
                >
                  {appointment.status}
                </div>
              </div>
            ))}
            
            <div style={styles.quickActions}>
              <button style={styles.actionButton}>New Appointment</button>
              <button style={styles.actionButton}>Reschedule</button>
              <button style={styles.actionButton}>View Calendar</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={styles.rightColumn}>
          {/* Recent Activities */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Recent Activities</h2>
            </div>
            
            {recentActivities.map(activity => (
              <div 
                key={activity.id} 
                style={styles.activityItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={styles.activityIcon}>{activity.icon}</div>
                <div style={styles.activityContent}>
                  <div style={styles.activityText}>{activity.action}</div>
                  <div style={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Quick Actions</h2>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'}}>
              <button style={{...styles.actionButton, width: '100%'}}>
                📝 Create Prescription
              </button>
              <button style={{...styles.actionButton, width: '100%'}}>
                🍽️ Generate Meal Plan
              </button>
              <button style={{...styles.actionButton, width: '100%'}}>
                📊 View Reports
              </button>
              <button style={{...styles.actionButton, width: '100%'}}>
                👥 Patient Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
