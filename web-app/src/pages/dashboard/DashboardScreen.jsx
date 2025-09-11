import React from 'react';
import { Card } from '../../components';
import { colors, typography, spacing, borderRadius } from '../../theme';

const DashboardScreen = () => {
  const containerStyles = {
    padding: spacing.lg,
    maxWidth: '100%',
    fontFamily: typography.fontFamily.primary,
  };

  const welcomeBannerStyles = {
    background: `linear-gradient(135deg, ${colors.primary.herbalGreen} 0%, ${colors.primary.sageGreen} 100%)`,
    borderRadius: borderRadius.xl,
    padding: `${spacing.xl} ${spacing['2xl']}`,
    color: colors.secondary.white,
    marginBottom: spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  };

  const welcomeTextStyles = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  };

  const welcomeSubtextStyles = {
    fontSize: typography.fontSize.base,
    opacity: 0.9,
    fontWeight: typography.fontWeight.normal,
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  };

  const statCardStyles = {
    textAlign: 'center',
  };

  const statNumberStyles = {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.herbalGreen,
    marginBottom: spacing.xs,
  };

  const statLabelStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.secondary.mediumGray,
    fontWeight: typography.fontWeight.medium,
  };

  const contentGridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  };

  const sectionHeaderStyles = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary.charcoal,
    marginBottom: spacing.md,
  };

  const appointmentItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottom: `1px solid ${colors.secondary.warmGray}`,
  };

  const appointmentInfoStyles = {
    flex: 1,
  };

  const patientNameStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary.charcoal,
    marginBottom: '2px',
  };

  const appointmentTimeStyles = {
    fontSize: typography.fontSize.xs,
    color: colors.secondary.mediumGray,
  };

  const statusBadgeStyles = (status) => ({
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: status === 'confirmed' ? colors.accent.success : 
                    status === 'pending' ? colors.ayurveda.turmericYellow : 
                    colors.secondary.mediumGray,
    color: colors.secondary.white,
  });

  const actionButtonStyles = {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    border: 'none',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    marginLeft: spacing.xs,
  };

  const approveButtonStyles = {
    ...actionButtonStyles,
    backgroundColor: colors.accent.success,
    color: colors.secondary.white,
  };

  const modifyButtonStyles = {
    ...actionButtonStyles,
    backgroundColor: colors.secondary.white,
    color: colors.primary.herbalGreen,
    border: `1px solid ${colors.primary.herbalGreen}`,
  };

  const stats = [
    { number: '156', label: 'Total Patients', icon: '👥' },
    { number: '8', label: 'Today\'s Appointments', icon: '📅' },
    { number: '3', label: 'Pending Approvals', icon: '⏳' },
    { number: '47', label: 'Consultations This Week', icon: '✅' },
  ];

  const upcomingAppointments = [
    { 
      id: 1, 
      patient: 'Mrs. Priya Sharma', 
      time: '10:00 AM', 
      condition: 'Diabetes Management', 
      status: 'confirmed',
      age: 45,
      lastVisit: '2 weeks ago',
      notes: 'Follow-up for diet plan effectiveness'
    },
    { 
      id: 2, 
      patient: 'Mr. Ravi Kumar', 
      time: '11:30 AM', 
      condition: 'Weight Management', 
      status: 'pending',
      age: 38,
      lastVisit: 'New patient',
      notes: 'Initial consultation for obesity treatment'
    },
    { 
      id: 3, 
      patient: 'Ms. Anjali Gupta', 
      time: '2:00 PM', 
      condition: 'PCOS Treatment', 
      status: 'confirmed',
      age: 28,
      lastVisit: '1 week ago',
      notes: 'Review hormonal balance progress'
    },
    { 
      id: 4, 
      patient: 'Mr. Suresh Reddy', 
      time: '3:30 PM', 
      condition: 'Hypertension', 
      status: 'confirmed',
      age: 52,
      lastVisit: '3 days ago',
      notes: 'Blood pressure monitoring and diet adjustment'
    },
  ];

  const pendingPlans = [
    { 
      id: 1, 
      patient: 'Mrs. Meera Singh', 
      condition: 'Diabetes Type 2', 
      aiSuggestion: 'Low-GI meal plan with bitter gourd, fenugreek, and turmeric',
      priority: 'high',
      generatedDate: '2 hours ago',
      dietType: 'Kapha-Pitta balancing',
      restrictions: 'No refined sugar, limited carbs'
    },
    { 
      id: 2, 
      patient: 'Mr. Ajay Patel', 
      condition: 'Obesity (BMI: 32)', 
      aiSuggestion: 'Kapha-reducing diet with intermittent fasting and metabolism boosters',
      priority: 'medium',
      generatedDate: '4 hours ago',
      dietType: 'Kapha pacifying',
      restrictions: 'Dairy limited, no fried foods'
    },
    { 
      id: 3, 
      patient: 'Ms. Kavya Nair', 
      condition: 'PCOS with insulin resistance', 
      aiSuggestion: 'Anti-inflammatory diet with turmeric, cinnamon, and spearmint',
      priority: 'high',
      generatedDate: '1 day ago',
      dietType: 'Pitta-Kapha balancing',
      restrictions: 'Gluten-free, low glycemic index'
    },
  ];

  return (
    <div style={containerStyles}>
      {/* Welcome Banner */}
      <div style={welcomeBannerStyles}>
        <div style={{ position: 'absolute', right: '20px', top: '20px', fontSize: '3rem', opacity: 0.2 }}>
          🌿
        </div>
        <div style={welcomeTextStyles}>Welcome back, Dr. Rajesh Kumar</div>
        <div style={welcomeSubtextStyles}>Here's your practice overview for today</div>
      </div>

      {/* Stats Cards */}
      <div style={statsGridStyles}>
        {stats.map((stat, index) => (
          <Card key={index} padding={spacing.lg} hover={false}>
            <div style={statCardStyles}>
              <div style={{ fontSize: '2rem', marginBottom: spacing.sm }}>{stat.icon}</div>
              <div style={statNumberStyles}>{stat.number}</div>
              <div style={statLabelStyles}>{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={contentGridStyles}>
        {/* Upcoming Appointments */}
        <Card padding={spacing.lg}>
          <div style={sectionHeaderStyles}>Today's Appointments (4 scheduled)</div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} style={appointmentItemStyles}>
                <div style={appointmentInfoStyles}>
                  <div style={patientNameStyles}>
                    {appointment.patient} 
                    <span style={{ 
                      fontSize: typography.fontSize.xs, 
                      color: colors.secondary.mediumGray,
                      marginLeft: spacing.xs 
                    }}>
                      (Age: {appointment.age})
                    </span>
                  </div>
                  <div style={appointmentTimeStyles}>
                    {appointment.time} • {appointment.condition}
                  </div>
                  <div style={{ 
                    fontSize: typography.fontSize.xs, 
                    color: colors.secondary.mediumGray,
                    marginTop: '2px',
                    fontStyle: 'italic'
                  }}>
                    Last visit: {appointment.lastVisit} • {appointment.notes}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: spacing.xs }}>
                  <div style={statusBadgeStyles(appointment.status)}>
                    {appointment.status.toUpperCase()}
                  </div>
                  <button style={{
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.sm,
                    border: `1px solid ${colors.primary.herbalGreen}`,
                    backgroundColor: 'transparent',
                    color: colors.primary.herbalGreen,
                    fontSize: typography.fontSize.xs,
                    cursor: 'pointer',
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending AI Meal Plans */}
        <Card padding={spacing.lg}>
          <div style={sectionHeaderStyles}>
            Pending Diet Plans (3 awaiting approval)
            <div style={{
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.normal,
              color: colors.secondary.mediumGray,
              marginTop: spacing.xs,
            }}>
              AI-generated meal plans ready for your review
            </div>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {pendingPlans.map((plan) => (
              <div key={plan.id} style={{ 
                ...appointmentItemStyles, 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: spacing.md,
                marginBottom: spacing.sm,
                backgroundColor: plan.priority === 'high' ? 'rgba(244, 162, 97, 0.1)' : 'transparent',
                borderLeft: plan.priority === 'high' ? `3px solid ${colors.ayurveda.turmericYellow}` : 'none',
              }}>
                <div style={{ width: '100%', marginBottom: spacing.sm }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={patientNameStyles}>
                        {plan.patient}
                        <span style={{
                          marginLeft: spacing.sm,
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: plan.priority === 'high' ? colors.accent.error : colors.accent.warning,
                          color: colors.secondary.white,
                          fontSize: typography.fontSize.xs,
                          borderRadius: borderRadius.sm,
                          fontWeight: typography.fontWeight.medium,
                        }}>
                          {plan.priority.toUpperCase()}
                        </span>
                      </div>
                      <div style={appointmentTimeStyles}>
                        {plan.condition} • {plan.dietType}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: typography.fontSize.xs, 
                      color: colors.secondary.mediumGray 
                    }}>
                      Generated: {plan.generatedDate}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: typography.fontSize.xs, 
                    color: colors.secondary.charcoal, 
                    marginTop: spacing.xs,
                    padding: spacing.sm,
                    backgroundColor: colors.secondary.warmGray,
                    borderRadius: borderRadius.sm,
                    fontStyle: 'italic'
                  }}>
                    <strong>AI Recommendation:</strong> {plan.aiSuggestion}
                  </div>
                  
                  <div style={{ 
                    fontSize: typography.fontSize.xs, 
                    color: colors.secondary.mediumGray,
                    marginTop: spacing.xs,
                  }}>
                    <strong>Restrictions:</strong> {plan.restrictions}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: spacing.sm, width: '100%' }}>
                  <button style={approveButtonStyles}>✓ Approve Plan</button>
                  <button style={modifyButtonStyles}>✏️ Modify & Review</button>
                  <button style={{
                    ...actionButtonStyles,
                    backgroundColor: 'transparent',
                    color: colors.secondary.mediumGray,
                    border: `1px solid ${colors.secondary.mediumGray}`,
                  }}>
                    📋 View Full Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts & Insights Section */}
      <Card padding={spacing.lg}>
        <div style={sectionHeaderStyles}>
          Practice Insights & Analytics
          <div style={{
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.normal,
            color: colors.secondary.mediumGray,
            marginTop: spacing.xs,
          }}>
            Patient progress tracking and health condition analysis
          </div>
        </div>
        
        {/* Insights Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: spacing.xl,
          marginBottom: spacing.lg,
        }}>
          {/* Patient Progress Chart */}
          <div style={{
            backgroundColor: colors.secondary.white,
            border: `1px solid ${colors.secondary.warmGray}`,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
          }}>
            <div style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.secondary.charcoal,
              marginBottom: spacing.md,
            }}>
              Patient Progress Trends (Last 30 days)
            </div>
            <div style={{
              height: '250px',
              backgroundColor: colors.secondary.warmGray,
              borderRadius: borderRadius.md,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.secondary.mediumGray,
              fontSize: typography.fontSize.sm,
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: spacing.md }}>📈</div>
              <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                Progress Analytics
              </div>
              <div style={{ fontSize: typography.fontSize.xs, lineHeight: 1.4 }}>
                • Average weight loss: 2.3 kg/month<br />
                • BMI improvement: 85% patients<br />
                • Treatment adherence: 92%<br />
                • Patient satisfaction: 4.8/5
              </div>
            </div>
          </div>
          
          {/* Health Conditions Distribution */}
          <div style={{
            backgroundColor: colors.secondary.white,
            border: `1px solid ${colors.secondary.warmGray}`,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
          }}>
            <div style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: colors.secondary.charcoal,
              marginBottom: spacing.md,
            }}>
              Condition Distribution
            </div>
            <div style={{
              height: '250px',
              backgroundColor: colors.secondary.warmGray,
              borderRadius: borderRadius.md,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.secondary.mediumGray,
              fontSize: typography.fontSize.sm,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: spacing.md }}>🥧</div>
              <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: spacing.sm }}>
                Patient Conditions
              </div>
              <div style={{ fontSize: typography.fontSize.xs, lineHeight: 1.6, textAlign: 'left' }}>
                🔵 Diabetes: 35% (54 patients)<br />
                🟠 PCOS: 22% (34 patients)<br />
                🟢 Obesity: 18% (28 patients)<br />
                🟡 Hypertension: 15% (23 patients)<br />
                🟣 Others: 10% (15 patients)
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: spacing.md,
        }}>
          {[
            { label: 'Success Rate', value: '94%', icon: '🎯', color: colors.accent.success },
            { label: 'Avg. Treatment Duration', value: '3.2 months', icon: '⏱️', color: colors.primary.herbalGreen },
            { label: 'Patient Retention', value: '87%', icon: '🔄', color: colors.accent.info },
            { label: 'Monthly Revenue', value: '₹2.45L', icon: '💰', color: colors.ayurveda.turmericYellow },
          ].map((metric, index) => (
            <div key={index} style={{
              backgroundColor: colors.secondary.white,
              border: `1px solid ${colors.secondary.warmGray}`,
              borderRadius: borderRadius.md,
              padding: spacing.md,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: spacing.xs }}>{metric.icon}</div>
              <div style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                color: metric.color,
                marginBottom: spacing.xs,
              }}>
                {metric.value}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.secondary.mediumGray,
              }}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardScreen;
